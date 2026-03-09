import * as Order from '../models/Order.js';
import * as DeliveryProof from '../models/DeliveryProof.js';
import * as Blockchain from '../services/blockchain.js';

/**
 * POST /delivery/proof
 * Body: { order_id, image_url?, gps_lat?, gps_lng?, notes? }
 * Driver uploads delivery proof. Order moves to in_transit -> delivered when proof submitted.
 */
export async function uploadProof(req, res) {
  try {
    const { order_id, image_url, gps_lat, gps_lng, notes } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });
    const order = await Order.getOrderByOrderId(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned driver can upload proof for this order' });
    }
    if (!['locked', 'in_transit'].includes(order.status)) {
      return res.status(400).json({ error: 'Order not in valid status for delivery proof' });
    }

    const proof = await DeliveryProof.createDeliveryProof({
      orderId: order.id,
      driverId: req.user.id,
      imageUrl: image_url,
      gpsLat: gps_lat,
      gpsLng: gps_lng,
      notes,
    });
    await Order.updateOrderStatus(order_id, 'delivered');
    res.status(201).json({ proof, order_id, status: 'delivered' });
  } catch (e) {
    console.error('Upload proof error:', e);
    res.status(500).json({ error: 'Failed to upload delivery proof' });
  }
}

/**
 * POST /delivery/confirm
 * Body: { order_id }
 * Customer confirms delivery. Then backend can release payment (or frontend calls release).
 */
export async function confirmDelivery(req, res) {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required' });
    const order = await Order.getOrderByOrderId(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the customer can confirm delivery' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Delivery proof must be uploaded first' });
    }

    if (Blockchain.isBlockchainConfigured()) {
      await Blockchain.confirmDelivery(order_id, order.id);
    }
    // Status stays 'delivered'; release is a separate step (POST /escrow/release)
    res.json({ success: true, order_id, message: 'Delivery confirmed' });
  } catch (e) {
    console.error('Confirm delivery error:', e);
    res.status(500).json({ error: e.message || 'Failed to confirm delivery' });
  }
}
