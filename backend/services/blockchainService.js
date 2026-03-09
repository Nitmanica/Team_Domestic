/**
 * High-level blockchain escrow service for TrustRoute.
 * Uses existing low-level services/blockchain.js, and also records entries in escrow_transactions.
 */
import * as LowLevel from './blockchain.js';
import { insertEscrowTx } from '../models/EscrowTransaction.js';

export async function createEscrowTransaction(order, customerWallet, driverWallet) {
  const amountWei = BigInt(order.amount_wei);
  const { txHash: createHash } = await LowLevel.createEscrow(
    order.order_id,
    customerWallet,
    driverWallet,
    amountWei
  );
  await insertEscrowTx({
    orderId: order.id,
    txHash: createHash,
    contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    amountWei: order.amount_wei,
    status: 'created',
  });
  const { txHash: lockHash } = await LowLevel.lockPayment(order.order_id, amountWei, order.id);
  await insertEscrowTx({
    orderId: order.id,
    txHash: lockHash,
    contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    amountWei: order.amount_wei,
    status: 'locked',
  });
  return { createHash, lockHash };
}

export async function lockPayment(order, amountWei) {
  const { txHash } = await LowLevel.lockPayment(order.order_id, amountWei, order.id);
  await insertEscrowTx({
    orderId: order.id,
    txHash,
    contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    amountWei: String(amountWei),
    status: 'locked',
  });
  return { txHash };
}

export async function confirmDelivery(order) {
  const { txHash } = await LowLevel.confirmDelivery(order.order_id, order.id);
  await insertEscrowTx({
    orderId: order.id,
    txHash,
    contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    amountWei: order.amount_wei,
    status: 'delivered',
  });
  return { txHash };
}

export async function releasePayment(order) {
  const { txHash } = await LowLevel.releasePayment(order.order_id, order.id);
  await insertEscrowTx({
    orderId: order.id,
    txHash,
    contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    amountWei: order.amount_wei,
    status: 'released',
  });
  return { txHash };
}

export async function refundEscrow(order) {
  const { txHash } = await LowLevel.refundCustomer(order.order_id, order.id);
  await insertEscrowTx({
    orderId: order.id,
    txHash,
    contractAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    amountWei: order.amount_wei,
    status: 'refunded',
  });
  return { txHash };
}

export function isBlockchainConfigured() {
  return LowLevel.isBlockchainConfigured();
}

