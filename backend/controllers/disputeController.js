import * as Order from '../models/Order.js';
import * as Dispute from '../models/Dispute.js';
import * as Blockchain from '../services/blockchain.js';

/**
 * POST /dispute
 * Body: { order_id, reason? }
 */
export async function createDispute(req, res) {
  try {
    const { order_id, reason } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });
    const order = await Order.getOrderByOrderId(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id && order.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Only customer or driver can raise a dispute' });
    }
    const dispute = await Dispute.createDispute({
      orderId: order.id,
      raisedBy: req.user.id,
      reason,
    });
    await Order.updateOrderStatus(order_id, 'disputed');
    res.status(201).json(dispute);
  } catch (e) {
    console.error('Create dispute error:', e);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
}

/**
 * GET /disputes - list open disputes (admin or own)
 */
export async function listDisputes(req, res) {
  try {
    if (req.user.role === 'admin') {
      const disputes = await Dispute.getAllOpenDisputes();
      return res.json(disputes);
    }
    // For non-admin, return disputes for their orders (simplified: get by order)
    const disputes = await Dispute.getAllOpenDisputes();
    const filtered = disputes.filter(
      (d) => d.raised_by === req.user.id
    );
    res.json(filtered);
  } catch (e) {
    console.error('List disputes error:', e);
    res.status(500).json({ error: 'Failed to list disputes' });
  }
}

/**
 * POST /admin/dispute/resolve
 * Body: { dispute_id, resolution (resolved_customer | resolved_driver | resolved_refund | resolved_penalty), resolution_notes?, penalty_amount_wei? }
 */
export async function resolveDispute(req, res) {
  try {
    const { dispute_id, resolution, resolution_notes, penalty_amount_wei } = req.body;
    if (!dispute_id || !resolution) {
      return res.status(400).json({ error: 'dispute_id and resolution are required' });
    }
    const validResolutions = ['resolved_customer', 'resolved_driver', 'resolved_refund', 'resolved_penalty'];
    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution type' });
    }

    const dispute = await Dispute.getDisputeById(dispute_id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    if (dispute.status !== 'open') {
      return res.status(400).json({ error: 'Dispute already resolved' });
    }

    const order = await Order.getOrderById(dispute.order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await Dispute.updateDisputeResolution(dispute_id, resolution, resolution_notes, req.user.id);

    if (resolution === 'resolved_refund' && Blockchain.isBlockchainConfigured()) {
      await Blockchain.refundCustomer(order.order_id, order.id);
      await Order.updateOrderStatus(order.order_id, 'refunded');
    } else if (resolution === 'resolved_penalty' && penalty_amount_wei && Blockchain.isBlockchainConfigured()) {
      await Blockchain.penaltyForDelay(order.order_id, penalty_amount_wei, order.id);
    } else if (resolution === 'resolved_driver') {
      await Order.updateOrderStatus(order.order_id, 'delivered');
    }
    const updated = await Dispute.getDisputeById(dispute_id);
    res.json(updated);
  } catch (e) {
    console.error('Resolve dispute error:', e);
    res.status(500).json({ error: e.message || 'Failed to resolve dispute' });
  }
}
