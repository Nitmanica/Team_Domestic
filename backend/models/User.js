import pool from '../config/db.js';

/**
 * User model - customers, drivers, admin.
 */
export async function createUser({ email, passwordHash, role, fullName, walletAddress }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name, wallet_address)
     VALUES (?, ?, ?, ?, ?)`,
    [email, passwordHash, role, fullName || null, walletAddress || null]
  );
  const id = result.insertId;
  const [rows] = await pool.query(
    'SELECT id, email, role, full_name, wallet_address, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, role, full_name, wallet_address, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, email, role, full_name, wallet_address, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

export async function getDrivers() {
  const [rows] = await pool.query(
    'SELECT id, email, full_name, wallet_address FROM users WHERE role = ? ORDER BY id',
    ['driver']
  );
  return rows;
}
