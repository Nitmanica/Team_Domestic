/**
 * Seed demo users (optional). Run after initDb: node config/seedDb.js
 */
import bcrypt from 'bcryptjs';
import pool from './db.js';

const SALT_ROUNDS = 10;

async function seed() {
  try {
    const hash = await bcrypt.hash('password123', SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES
         ('admin@trustroute.com', ?, 'admin', 'Admin User'),
         ('customer@trustroute.com', ?, 'customer', 'Arjun M.'),
         ('driver@trustroute.com', ?, 'driver', 'Raj Kumar')
       ON DUPLICATE KEY UPDATE email = email`,
      [hash, hash, hash]
    );
    console.log('Seed completed. Demo users: admin@trustroute.com, customer@trustroute.com, driver@trustroute.com / password: password123');
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
