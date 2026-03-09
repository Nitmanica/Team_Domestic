/**
 * Initialize MySQL schema (tables) for TrustRoute Escrow.
 * Run: node config/initDb.js
 */
import pool from './db.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer','driver','admin') NOT NULL,
    full_name VARCHAR(255) NULL,
    wallet_address VARCHAR(42) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    driver_id INT NULL,
    pickup_location VARCHAR(500) NULL,
    drop_location VARCHAR(500) NULL,
    cargo_category VARCHAR(100) NULL,
    weight_kg INT NULL,
    vehicle_type VARCHAR(50) NULL,
    distance_km DECIMAL(10,2) NULL,
    amount_wei VARCHAR(78) NOT NULL,
    amount_display VARCHAR(50) NULL,
    status ENUM('created','confirmed','locked','in_transit','delivered','released','refunded','disputed','cancelled') NOT NULL DEFAULT 'created',
    escrow_contract_address VARCHAR(42) NULL,
    escrow_tx_lock VARCHAR(66) NULL,
    escrow_tx_release VARCHAR(66) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_orders_driver FOREIGN KEY (driver_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS delivery_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    image_url VARCHAR(1000) NULL,
    gps_lat DECIMAL(12,8) NULL,
    gps_lng DECIMAL(12,8) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proofs_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_proofs_driver FOREIGN KEY (driver_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    raised_by INT NOT NULL,
    reason TEXT NULL,
    status ENUM('open','resolved_customer','resolved_driver','resolved_refund','resolved_penalty') NOT NULL DEFAULT 'open',
    resolution_notes TEXT NULL,
    resolved_by INT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_disputes_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_disputes_raised_by FOREIGN KEY (raised_by) REFERENCES users(id),
    CONSTRAINT fk_disputes_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS blockchain_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    tx_type VARCHAR(50) NOT NULL,
    contract_address VARCHAR(42) NULL,
    payload JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chain_order (order_id),
    CONSTRAINT fk_chain_order FOREIGN KEY (order_id) REFERENCES orders(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS escrow_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    contract_address VARCHAR(42) NULL,
    amount_wei VARCHAR(78) NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_escrow_tx_order FOREIGN KEY (order_id) REFERENCES orders(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE INDEX idx_orders_customer ON orders(customer_id);`,
  `CREATE INDEX idx_orders_driver ON orders(driver_id);`,
  `CREATE INDEX idx_orders_status ON orders(status);`,
  `CREATE INDEX idx_orders_order_id ON orders(order_id);`,
  `CREATE INDEX idx_delivery_proofs_order ON delivery_proofs(order_id);`,
  `CREATE INDEX idx_disputes_order ON disputes(order_id);`,
];

async function init() {
  try {
    for (const sql of statements) {
      try {
        await pool.query(sql);
      } catch (e) {
        // MySQL throws if index already exists; ignore those.
        if (!String(e?.message || '').includes('Duplicate key name')) throw e;
      }
    }
    console.log('MySQL schema initialized successfully.');
  } catch (e) {
    console.error('Init failed:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
