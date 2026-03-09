import * as Order from '../models/Order.js';
import { getOrderById } from '../models/Order.js';

/**
 * POST /order
 * Body: pickup, drop, cargo_category, weight_kg, vehicle_type, distance_km, amount_wei, amount_display, driver_id?
 */
export async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const {
      pickup_location,
      drop_location,
      cargo_category,
      weight_kg,
      vehicle_type,
      distance_km,
      amount_wei,
      amount_display,
      driver_id,
    } = req.body;
    if (!amount_wei) {
      return res.status(400).json({ error: 'amount_wei is required' });
    }
    const order = await Order.createOrder({
      customerId: userId,
      driverId: driver_id || null,
      pickupLocation: pickup_location,
      dropLocation: drop_location,
      cargoCategory: cargo_category,
      weightKg: weight_kg,
      vehicleType: vehicle_type,
      distanceKm: distance_km,
      amountWei: amount_wei,
      amountDisplay: amount_display,
    });
    res.status(201).json(order);
  } catch (e) {
    console.error('Create order error:', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

/**
 * GET /order/:orderId - get single order by order_id string
 */
export async function getOrder(req, res) {
  try {
    const order = await Order.getOrderByOrderId(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (e) {
    console.error('Get order error:', e);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

/**
 * GET /orders/customer - my orders (customer)
 */
export async function getMyOrdersCustomer(req, res) {
  try {
    const orders = await Order.getOrdersByCustomer(req.user.id);
    res.json(orders);
  } catch (e) {
    console.error('Get customer orders error:', e);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * GET /orders/driver - my orders (driver)
 */
export async function getMyOrdersDriver(req, res) {
  try {
    const orders = await Order.getOrdersByDriver(req.user.id);
    res.json(orders);
  } catch (e) {
    console.error('Get driver orders error:', e);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * GET /orders/available - available orders for drivers (status locked, no driver)
 */
export async function getAvailableOrders(req, res) {
  try {
    const orders = await Order.getAvailableOrdersForDriver();
    res.json(orders);
  } catch (e) {
    console.error('Get available orders error:', e);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * PATCH /order/:orderId/accept - driver accepts order
 */
export async function acceptOrder(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.getOrderByOrderId(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'locked') {
      return res.status(400).json({ error: 'Order is not available for acceptance' });
    }
    if (order.driver_id) return res.status(400).json({ error: 'Order already has a driver' });
    const updated = await Order.updateOrderStatus(orderId, 'locked', { driver_id: req.user.id });
    res.json(updated);
  } catch (e) {
    console.error('Accept order error:', e);
    res.status(500).json({ error: 'Failed to accept order' });
  }
}

/**
 * GET /orders/all - admin: all orders
 */
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (e) {
    console.error('Get all orders error:', e);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}
