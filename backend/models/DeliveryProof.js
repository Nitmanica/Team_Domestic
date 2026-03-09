import pool from '../config/db.js';

/**
 * Delivery proof model - driver uploads proof of delivery.
 */
export async function createDeliveryProof({ orderId, driverId, imageUrl, gpsLat, gpsLng, notes }) {
  const [result] = await pool.query(
    `INSERT INTO delivery_proofs (order_id, driver_id, image_url, gps_lat, gps_lng, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [orderId, driverId, imageUrl || null, gpsLat || null, gpsLng || null, notes || null]
  );
  const id = result.insertId;
  const [rows] = await pool.query('SELECT * FROM delivery_proofs WHERE id = ?', [id]);
  return rows[0];
}

export async function getProofsByOrderId(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM delivery_proofs WHERE order_id = ? ORDER BY created_at DESC',
    [orderId]
  );
  return rows;
}

export async function getProofByOrderId(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM delivery_proofs WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
    [orderId]
  );
  return rows[0] || null;
}
