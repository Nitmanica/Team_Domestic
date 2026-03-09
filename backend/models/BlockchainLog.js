import pool from '../config/db.js';

/**
 * Blockchain transaction log for audit trail.
 */
export async function logTx({ orderId, txHash, txType, contractAddress, payload }) {
  await pool.query(
    `INSERT INTO blockchain_logs (order_id, tx_hash, tx_type, contract_address, payload)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId || null, txHash, txType, contractAddress || null, payload ? JSON.stringify(payload) : null]
  );
}

export async function getLogsByOrderId(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM blockchain_logs WHERE order_id = ? ORDER BY created_at DESC',
    [orderId]
  );
  return rows;
}
