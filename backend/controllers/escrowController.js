import * as Order from '../models/Order.js';
import * as BlockchainService from '../services/blockchainService.js';

/**
 * POST /escrow/lock
 * Body: { order_id } - order_id is the string e.g. TR-4522
 * Locks payment in smart contract and updates order status to locked.
 */
export async function lockPayment(req, res) {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });
    const order = await Order.getOrderByOrderId(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the customer can lock payment for this order' });
    }
    if (order.status !== 'created' && order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Order cannot be locked in current status' });
    }

    const amountWei = order.amount_wei;
    if (!BlockchainService.isBlockchainConfigured()) {
      // Demo mode: just update DB
      await Order.updateOrderStatus(order_id, 'locked', {
        escrow_tx_lock: '0x' + '0'.repeat(64),
        escrow_contract_address: process.env.ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      });
      return res.json({
        success: true,
        order_id,
        status: 'locked',
        tx_hash: null,
        message: 'Demo mode: payment marked as locked (no blockchain)',
      });
    }

    const customerAddress = req.user.wallet_address || '0x0000000000000000000000000000000000000001';
    const driverAddress = order.driver_wallet_address || '0x0000000000000000000000000000000000000002';
    const { lockHash: txHash } = await BlockchainService.createEscrowTransaction(
      order,
      customerAddress,
      driverAddress
    );
    await Order.updateOrderStatus(order_id, 'locked', {
      escrow_tx_lock: txHash,
      escrow_contract_address: process.env.ESCROW_CONTRACT_ADDRESS,
    });
    res.json({ success: true, order_id, status: 'locked', tx_hash: txHash });
  } catch (e) {
    console.error('Lock payment error:', e);
    res.status(500).json({ error: e.message || 'Failed to lock payment' });
  }
}

/**
 * POST /escrow/release
 * Body: { order_id }
 * Releases payment to driver (after delivery confirmed).
 */
export async function releasePayment(req, res) {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });
    const order = await Order.getOrderByOrderId(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Delivery must be confirmed before release' });
    }

    if (!BlockchainService.isBlockchainConfigured()) {
      await Order.updateOrderStatus(order_id, 'released');
      return res.json({
        success: true,
        order_id,
        status: 'released',
        tx_hash: null,
        message: 'Demo mode: payment marked as released',
      });
    }

    const { txHash } = await BlockchainService.releasePayment(order);
    await Order.updateOrderStatus(order_id, 'released', { escrow_tx_release: txHash });
    res.json({ success: true, order_id, status: 'released', tx_hash: txHash });
  } catch (e) {
    console.error('Release payment error:', e);
    res.status(500).json({ error: e.message || 'Failed to release payment' });
  }
}
