// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Escrow
 * @notice Smart contract escrow for TrustRoute transportation payments.
 * Customer locks funds; driver receives on delivery confirmation; admin can refund or apply penalty.
 */
contract Escrow {
    enum EscrowStatus {
        None,       // 0 - not created
        Created,    // 1 - created, not funded
        Locked,     // 2 - payment locked
        Delivered,  // 3 - delivery confirmed
        Released,   // 4 - paid to driver
        Refunded    // 5 - refunded to customer
    }

    struct EscrowRecord {
        address customer;
        address driver;
        uint256 amount;
        EscrowStatus status;
    }

    mapping(bytes32 => EscrowRecord) public escrows;

    address public admin;

    event EscrowCreated(bytes32 indexed orderId, address customer, address driver, uint256 amount);
    event PaymentLocked(bytes32 indexed orderId, uint256 amount);
    event DeliveryConfirmed(bytes32 indexed orderId);
    event PaymentReleased(bytes32 indexed orderId, address driver, uint256 amount);
    event CustomerRefunded(bytes32 indexed orderId, uint256 amount);
    event PenaltyApplied(bytes32 indexed orderId, uint256 penaltyAmount);

    error EscrowAlreadyExists();
    error EscrowNotFound();
    error InvalidStatus();
    error InvalidAmount();
    error TransferFailed();
    error Unauthorized();

    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Create an escrow record for an order (no funds transferred yet).
     */
    function createEscrow(
        bytes32 orderId,
        address customer,
        address driver,
        uint256 amount
    ) external {
        if (escrows[orderId].status != EscrowStatus.None) revert EscrowAlreadyExists();
        escrows[orderId] = EscrowRecord({
            customer: customer,
            driver: driver,
            amount: amount,
            status: EscrowStatus.Created
        });
        emit EscrowCreated(orderId, customer, driver, amount);
    }

    /**
     * @notice Lock payment in escrow. Caller must send msg.value >= amount for this order.
     * In production, customer would call this; for hackathon, backend relayer can call with same amount.
     */
    function lockPayment(bytes32 orderId) external payable {
        EscrowRecord storage e = escrows[orderId];
        if (e.status == EscrowStatus.None) revert EscrowNotFound();
        if (e.status != EscrowStatus.Created) revert InvalidStatus();
        if (msg.value < e.amount) revert InvalidAmount();
        e.status = EscrowStatus.Locked;
        emit PaymentLocked(orderId, msg.value);
    }

    /**
     * @notice Mark delivery as confirmed (customer or backend on behalf of customer).
     */
    function confirmDelivery(bytes32 orderId) external {
        EscrowRecord storage e = escrows[orderId];
        if (e.status == EscrowStatus.None) revert EscrowNotFound();
        if (e.status != EscrowStatus.Locked) revert InvalidStatus();
        e.status = EscrowStatus.Delivered;
        emit DeliveryConfirmed(orderId);
    }

    /**
     * @notice Release payment to driver. Only after confirmDelivery.
     */
    function releasePayment(bytes32 orderId) external {
        EscrowRecord storage e = escrows[orderId];
        if (e.status == EscrowStatus.None) revert EscrowNotFound();
        if (e.status != EscrowStatus.Delivered) revert InvalidStatus();
        e.status = EscrowStatus.Released;
        uint256 amount = e.amount;
        (bool ok,) = payable(e.driver).call{ value: amount }("");
        if (!ok) revert TransferFailed();
        emit PaymentReleased(orderId, e.driver, amount);
    }

    /**
     * @notice Refund customer (e.g. dispute resolved in customer's favor or cancel).
     */
    function refundCustomer(bytes32 orderId) external {
        if (msg.sender != admin) revert Unauthorized();
        EscrowRecord storage e = escrows[orderId];
        if (e.status == EscrowStatus.None) revert EscrowNotFound();
        if (e.status != EscrowStatus.Locked && e.status != EscrowStatus.Delivered) revert InvalidStatus();
        e.status = EscrowStatus.Refunded;
        uint256 amount = e.amount;
        (bool ok,) = payable(e.customer).call{ value: amount }("");
        if (!ok) revert TransferFailed();
        emit CustomerRefunded(orderId, amount);
    }

    /**
     * @notice Apply delay penalty: deduct from amount to driver; remainder goes to driver, penalty to customer or burn.
     * Simplified: we send (amount - penalty) to driver and penalty to customer.
     */
    function penaltyForDelay(bytes32 orderId, uint256 penaltyAmount) external {
        if (msg.sender != admin) revert Unauthorized();
        EscrowRecord storage e = escrows[orderId];
        if (e.status == EscrowStatus.None) revert EscrowNotFound();
        if (e.status != EscrowStatus.Delivered) revert InvalidStatus();
        if (penaltyAmount > e.amount) revert InvalidAmount();
        e.status = EscrowStatus.Released;
        uint256 toDriver = e.amount - penaltyAmount;
        if (toDriver > 0) {
            (bool ok1,) = payable(e.driver).call{ value: toDriver }("");
            if (!ok1) revert TransferFailed();
        }
        if (penaltyAmount > 0) {
            (bool ok2,) = payable(e.customer).call{ value: penaltyAmount }("");
            if (!ok2) revert TransferFailed();
        }
        emit PenaltyApplied(orderId, penaltyAmount);
    }

    /**
     * @notice Get escrow record for an order.
     */
    function getEscrow(bytes32 orderId) external view returns (
        address customer,
        address driver,
        uint256 amount,
        EscrowStatus status
    ) {
        EscrowRecord storage e = escrows[orderId];
        return (e.customer, e.driver, e.amount, e.status);
    }

    receive() external payable {}
}
