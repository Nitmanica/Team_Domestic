import pool from '../config/db.js';

/**
 * Dispute model - disputes and admin resolution.
 */
export async function createDispute({ orderId, raisedBy, reason }) {
  const [result] = await pool.query(
    `INSERT INTO disputes (order_id, raised_by, reason, status)
     VALUES (?, ?, ?, 'open')`,
    [orderId, raisedBy, reason || null]
  );
  const id = result.insertId;
  const [rows] = await pool.query('SELECT * FROM disputes WHERE id = ?', [id]);
  return rows[0];
}

export async function getDisputesByOrderId(orderId) {
  const [rows] = await pool.query(
    `SELECT d.*, u.full_name AS raised_by_name FROM disputes d
     LEFT JOIN users u ON d.raised_by = u.id
     WHERE d.order_id = ? ORDER BY d.created_at DESC`,
    [orderId]
  );
  return rows;
}

export async function getDisputeById(id) {
  const [rows] = await pool.query(
    `SELECT d.*, o.order_id AS order_ref FROM disputes d
     LEFT JOIN orders o ON d.order_id = o.id
     WHERE d.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getAllOpenDisputes() {
  const [rows] = await pool.query(
    `SELECT d.*, o.order_id AS order_ref, o.amount_display
     FROM disputes d
     JOIN orders o ON d.order_id = o.id
     WHERE d.status = 'open' ORDER BY d.created_at DESC`
  );
  return rows;
}

export async function updateDisputeResolution(disputeId, status, resolutionNotes, resolvedBy) {
  await pool.query(
    `UPDATE disputes SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, resolutionNotes || null, resolvedBy, disputeId]
  );
  return await getDisputeById(disputeId);
}
