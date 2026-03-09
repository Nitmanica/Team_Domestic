import pool from '../config/db.js';

/**
 * Order model - bookings and escrow-linked orders.
 */
function generateOrderId() {
  return 'TR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function createOrder({
  customerId,
  driverId,
  pickupLocation,
  dropLocation,
  cargoCategory,
  weightKg,
  vehicleType,
  distanceKm,
  amountWei,
  amountDisplay,
}) {
  const orderId = generateOrderId();
  await pool.query(
    `INSERT INTO orders (
      order_id, customer_id, driver_id, pickup_location, drop_location,
      cargo_category, weight_kg, vehicle_type, distance_km, amount_wei, amount_display, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'created')`,
    [
      orderId,
      customerId,
      driverId || null,
      pickupLocation || null,
      dropLocation || null,
      cargoCategory || null,
      weightKg || null,
      vehicleType || null,
      distanceKm || null,
      amountWei,
      amountDisplay || null,
    ]
  );
  return await getOrderByOrderId(orderId);
}

export async function getOrderByOrderId(orderId) {
  const [rows] = await pool.query(
    `SELECT o.*, 
      c.full_name AS customer_name, c.email AS customer_email, c.wallet_address AS customer_wallet_address,
      d.full_name AS driver_name, d.email AS driver_email, d.wallet_address AS driver_wallet_address
     FROM orders o
     LEFT JOIN users c ON o.customer_id = c.id
     LEFT JOIN users d ON o.driver_id = d.id
     WHERE o.order_id = ?`,
    [orderId]
  );
  return rows[0] || null;
}

export async function getOrderById(id) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getOrdersByCustomer(customerId) {
  const [rows] = await pool.query(
    `SELECT o.*, d.full_name AS driver_name FROM orders o
     LEFT JOIN users d ON o.driver_id = d.id
     WHERE o.customer_id = ? ORDER BY o.created_at DESC`,
    [customerId]
  );
  return rows;
}

export async function getOrdersByDriver(driverId) {
  const [rows] = await pool.query(
    `SELECT o.*, c.full_name AS customer_name FROM orders o
     LEFT JOIN users c ON o.customer_id = c.id
     WHERE o.driver_id = ? ORDER BY o.created_at DESC`,
    [driverId]
  );
  return rows;
}

export async function getAvailableOrdersForDriver() {
  const [rows] = await pool.query(
    `SELECT o.*, c.full_name AS customer_name FROM orders o
     LEFT JOIN users c ON o.customer_id = c.id
     WHERE o.status = 'locked' AND o.driver_id IS NULL ORDER BY o.created_at DESC`
  );
  return rows;
}

export async function getAllOrders() {
  const [rows] = await pool.query(
    `SELECT o.*, c.full_name AS customer_name, d.full_name AS driver_name
     FROM orders o
     LEFT JOIN users c ON o.customer_id = c.id
     LEFT JOIN users d ON o.driver_id = d.id
     ORDER BY o.created_at DESC`
  );
  return rows;
}

export async function updateOrderStatus(orderId, status, extra = {}) {
  const set = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [status];
  if (extra.escrow_contract_address) {
    set.push('escrow_contract_address = ?');
    values.push(extra.escrow_contract_address);
  }
  if (extra.escrow_tx_lock) {
    set.push('escrow_tx_lock = ?');
    values.push(extra.escrow_tx_lock);
  }
  if (extra.escrow_tx_release) {
    set.push('escrow_tx_release = ?');
    values.push(extra.escrow_tx_release);
  }
  if (extra.driver_id !== undefined) {
    set.push('driver_id = ?');
    values.push(extra.driver_id);
  }
  values.push(orderId);
  await pool.query(
    `UPDATE orders SET ${set.join(', ')} WHERE order_id = ?`,
    values
  );
  return await getOrderByOrderId(orderId);
}

export async function updateOrderById(id, updates) {
  const allowed = ['status', 'driver_id', 'escrow_contract_address', 'escrow_tx_lock', 'escrow_tx_release', 'updated_at'];
  const set = [];
  const values = [];
  for (const [k, v] of Object.entries(updates)) {
    if (!allowed.includes(k)) continue;
    if (k === 'updated_at') {
      set.push('updated_at = CURRENT_TIMESTAMP');
      continue;
    }
    set.push(`${k} = ?`);
    values.push(v);
  }
  if (set.length === 0) return null;
  values.push(id);
  await pool.query(`UPDATE orders SET ${set.join(', ')} WHERE id = ?`, values);
  return await getOrderById(id);
}
