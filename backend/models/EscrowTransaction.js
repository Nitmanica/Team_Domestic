import pool from '../config/db.js';

/**
 * Escrow transaction log - high-level financial events per order.
 */
export async function insertEscrowTx({ orderId, txHash, contractAddress, amountWei, status }) {
  await pool.query(
    `INSERT INTO escrow_transactions (order_id, tx_hash, contract_address, amount_wei, status)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, txHash, contractAddress || null, amountWei || null, status]
  );
}

export async function getEscrowTxByOrder(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM escrow_transactions WHERE order_id = ? ORDER BY created_at DESC',
    [orderId]
  );
  return rows;
}

