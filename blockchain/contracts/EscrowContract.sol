// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EscrowContract
 * @notice Escrow contract for TrustRoute.
 * - Uses orderId as an external reference (hashed to bytes32 internally)
 * - Stores minimal financial and state data on-chain
 * - Integrates with off-chain Razorpay flow: contract is called only after fiat payment succeeds
 */
contract EscrowContract {
    enum PaymentStatus {
        None,
        Created,
        Locked,
        ProofSubmitted,
        Delivered,
        Released,
        Refunded
    }

    struct Escrow {
        address customer;
        address driver;
        uint256 amount; // in wei
        PaymentStatus status;
        bytes32 proofHash; // hash of delivery proof
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(bytes32 => Escrow) private escrows;

    address public admin;

    event EscrowCreated(bytes32 indexed orderIdHash, string orderId, address indexed customer, address indexed driver, uint256 amount);
    event PaymentLocked(bytes32 indexed orderIdHash, string orderId, uint256 amount);
    event DeliveryProofSubmitted(bytes32 indexed orderIdHash, string orderId, bytes32 proofHash);
    event DeliveryConfirmed(bytes32 indexed orderIdHash, string orderId);
    event PaymentReleased(bytes32 indexed orderIdHash, string orderId, address driver, uint256 amount);
    event CustomerRefunded(bytes32 indexed orderIdHash, string orderId, uint256 amount);

    error EscrowAlreadyExists();
    error EscrowNotFound();
    error InvalidStatus();
    error InvalidAmount();
    error TransferFailed();
    error Unauthorized();

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    function _id(string memory orderId) internal pure returns (bytes32) {
        return sha256(bytes(orderId));
    }

    function getEscrowByHash(bytes32 orderIdHash) public view returns (Escrow memory) {
        return escrows[orderIdHash];
    }

    function createEscrow(
        string calldata orderId,
        address customerWallet,
        address driverWallet,
        uint256 amount
    ) external onlyAdmin {
        bytes32 oid = _id(orderId);
        Escrow storage e = escrows[oid];
        if (e.status != PaymentStatus.None) revert EscrowAlreadyExists();

        escrows[oid] = Escrow({
            customer: customerWallet,
            driver: driverWallet,
            amount: amount,
            status: PaymentStatus.Created,
            proofHash: bytes32(0),
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit EscrowCreated(oid, orderId, customerWallet, driverWallet, amount);
    }

    /**
     * @notice Lock payment in escrow. Backend relayer sends ETH to this contract after Razorpay success.
     */
    function lockPayment(string calldata orderId) external payable onlyAdmin {
        bytes32 oid = _id(orderId);
        Escrow storage e = escrows[oid];
        if (e.status == PaymentStatus.None) revert EscrowNotFound();
        if (e.status != PaymentStatus.Created) revert InvalidStatus();
        if (msg.value < e.amount) revert InvalidAmount();

        e.status = PaymentStatus.Locked;
        e.updatedAt = block.timestamp;
        emit PaymentLocked(oid, orderId, msg.value);
    }

    /**
     * @notice Store hash of delivery proof (off-chain file, on-chain hash).
     */
    function submitDeliveryProof(string calldata orderId, bytes32 proofHash) external onlyAdmin {
        bytes32 oid = _id(orderId);
        Escrow storage e = escrows[oid];
        if (e.status == PaymentStatus.None) revert EscrowNotFound();
        if (e.status != PaymentStatus.Locked && e.status != PaymentStatus.ProofSubmitted) revert InvalidStatus();

        e.proofHash = proofHash;
        e.status = PaymentStatus.ProofSubmitted;
        e.updatedAt = block.timestamp;
        emit DeliveryProofSubmitted(oid, orderId, proofHash);
    }

    /**
     * @notice Confirm delivery (after customer confirmation off-chain).
     */
    function confirmDelivery(string calldata orderId) external onlyAdmin {
        bytes32 oid = _id(orderId);
        Escrow storage e = escrows[oid];
        if (e.status == PaymentStatus.None) revert EscrowNotFound();
        if (e.status != PaymentStatus.Locked && e.status != PaymentStatus.ProofSubmitted) revert InvalidStatus();

        e.status = PaymentStatus.Delivered;
        e.updatedAt = block.timestamp;
        emit DeliveryConfirmed(oid, orderId);
    }

    /**
     * @notice Release payment to driver.
     */
    function releasePayment(string calldata orderId) external onlyAdmin {
        bytes32 oid = _id(orderId);
        Escrow storage e = escrows[oid];
        if (e.status == PaymentStatus.None) revert EscrowNotFound();
        if (e.status != PaymentStatus.Delivered) revert InvalidStatus();

        e.status = PaymentStatus.Released;
        e.updatedAt = block.timestamp;
        uint256 amount = e.amount;
        (bool ok, ) = payable(e.driver).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit PaymentReleased(oid, orderId, e.driver, amount);
    }

    /**
     * @notice Refund customer (admin-triggered).
     */
    function refundCustomer(string calldata orderId) external onlyAdmin {
        bytes32 oid = _id(orderId);
        Escrow storage e = escrows[oid];
        if (e.status == PaymentStatus.None) revert EscrowNotFound();
        if (e.status != PaymentStatus.Locked && e.status != PaymentStatus.ProofSubmitted && e.status != PaymentStatus.Delivered) revert InvalidStatus();

        e.status = PaymentStatus.Refunded;
        e.updatedAt = block.timestamp;
        uint256 amount = e.amount;
        (bool ok, ) = payable(e.customer).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit CustomerRefunded(oid, orderId, amount);
    }

    receive() external payable {}
}

