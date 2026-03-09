/**
 * Blockchain service - interacts with Escrow smart contract via ethers.js.
 * Backend holds a wallet to submit lock/release/refund/penalty transactions.
 */
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { logTx } from '../models/BlockchainLog.js';

dotenv.config();

const RPC_URL = process.env.ETH_RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.ESCROW_WALLET_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

let provider;
let wallet;
let contract;

// ABI for Escrow.sol (minimal for our functions)
const ESCROW_ABI = [
  'function createEscrow(bytes32 orderId, address customer, address driver, uint256 amount) external',
  'function lockPayment(bytes32 orderId) external payable',
  'function confirmDelivery(bytes32 orderId) external',
  'function releasePayment(bytes32 orderId) external',
  'function refundCustomer(bytes32 orderId) external',
  'function penaltyForDelay(bytes32 orderId, uint256 penaltyAmount) external',
  'function getEscrow(bytes32 orderId) external view returns (address customer, address driver, uint256 amount, uint8 status)',
  'event EscrowCreated(bytes32 indexed orderId, address customer, address driver, uint256 amount)',
  'event PaymentLocked(bytes32 indexed orderId, uint256 amount)',
  'event DeliveryConfirmed(bytes32 indexed orderId)',
  'event PaymentReleased(bytes32 indexed orderId, address driver, uint256 amount)',
  'event CustomerRefunded(bytes32 indexed orderId, uint256 amount)',
  'event PenaltyApplied(bytes32 indexed orderId, uint256 penaltyAmount)',
];

function getContract() {
  if (!CONTRACT_ADDRESS) throw new Error('ESCROW_CONTRACT_ADDRESS not set');
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  if (!wallet && PRIVATE_KEY) {
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  }
  if (!contract && wallet) {
    contract = new ethers.Contract(CONTRACT_ADDRESS, ESCROW_ABI, wallet);
  }
  return contract;
}

/**
 * Convert string orderId (e.g. TR-4522) to bytes32 for contract.
 */
function orderIdToBytes32(orderId) {
  const hex = ethers.keccak256(ethers.toUtf8Bytes(orderId));
  return hex;
}

/**
 * Create escrow record on-chain (no funds moved yet).
 */
export async function createEscrow(orderId, customerAddress, driverAddress, amountWei) {
  const c = getContract();
  const orderIdHash = orderIdToBytes32(orderId);
  const tx = await c.createEscrow(orderIdHash, customerAddress, driverAddress, amountWei);
  const receipt = await tx.wait();
  await logTx({
    orderId: null,
    txHash: receipt.hash,
    txType: 'createEscrow',
    contractAddress: CONTRACT_ADDRESS,
    payload: { orderId, customerAddress, driverAddress, amountWei: amountWei.toString() },
  });
  return { txHash: receipt.hash, success: true };
}

/**
 * Lock payment in escrow (backend wallet sends ETH to contract).
 */
export async function lockPayment(orderId, amountWei, orderDbId) {
  const c = getContract();
  const orderIdHash = orderIdToBytes32(orderId);
  const tx = await c.lockPayment(orderIdHash, { value: amountWei });
  const receipt = await tx.wait();
  await logTx({
    orderId: orderDbId,
    txHash: receipt.hash,
    txType: 'lockPayment',
    contractAddress: CONTRACT_ADDRESS,
    payload: { orderId, amountWei: amountWei.toString() },
  });
  return { txHash: receipt.hash, success: true };
}

/**
 * Mark delivery as confirmed (customer or backend on behalf).
 */
export async function confirmDelivery(orderId, orderDbId) {
  const c = getContract();
  const orderIdHash = orderIdToBytes32(orderId);
  const tx = await c.confirmDelivery(orderIdHash);
  const receipt = await tx.wait();
  await logTx({
    orderId: orderDbId,
    txHash: receipt.hash,
    txType: 'confirmDelivery',
    contractAddress: CONTRACT_ADDRESS,
    payload: { orderId },
  });
  return { txHash: receipt.hash, success: true };
}

/**
 * Release payment to driver.
 */
export async function releasePayment(orderId, orderDbId) {
  const c = getContract();
  const orderIdHash = orderIdToBytes32(orderId);
  const tx = await c.releasePayment(orderIdHash);
  const receipt = await tx.wait();
  await logTx({
    orderId: orderDbId,
    txHash: receipt.hash,
    txType: 'releasePayment',
    contractAddress: CONTRACT_ADDRESS,
    payload: { orderId },
  });
  return { txHash: receipt.hash, success: true };
}

/**
 * Refund customer (dispute or cancel).
 */
export async function refundCustomer(orderId, orderDbId) {
  const c = getContract();
  const orderIdHash = orderIdToBytes32(orderId);
  const tx = await c.refundCustomer(orderIdHash);
  const receipt = await tx.wait();
  await logTx({
    orderId: orderDbId,
    txHash: receipt.hash,
    txType: 'refundCustomer',
    contractAddress: CONTRACT_ADDRESS,
    payload: { orderId },
  });
  return { txHash: receipt.hash, success: true };
}

/**
 * Apply delay penalty (admin).
 */
export async function penaltyForDelay(orderId, penaltyAmountWei, orderDbId) {
  const c = getContract();
  const orderIdHash = orderIdToBytes32(orderId);
  const tx = await c.penaltyForDelay(orderIdHash, penaltyAmountWei);
  const receipt = await tx.wait();
  await logTx({
    orderId: orderDbId,
    txHash: receipt.hash,
    txType: 'penaltyForDelay',
    contractAddress: CONTRACT_ADDRESS,
    payload: { orderId, penaltyAmountWei: penaltyAmountWei.toString() },
  });
  return { txHash: receipt.hash, success: true };
}

/**
 * Check if blockchain is configured and contract is set.
 */
export function isBlockchainConfigured() {
  return !!(PRIVATE_KEY && CONTRACT_ADDRESS);
}
