import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'orders.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  // Create orders table (approved orders)
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      orderId TEXT NOT NULL,
      date TEXT NOT NULL,
      item TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table (approved transactions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      orderId TEXT NOT NULL,
      date TEXT NOT NULL,
      item TEXT NOT NULL,
      price REAL NOT NULL,
      txnType TEXT NOT NULL,
      txnAmount REAL NOT NULL,
      order_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    )
  `);

  // Create pending_transactions table (transactions awaiting approval/rejection)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pending_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      orderId TEXT NOT NULL,
      date TEXT NOT NULL,
      item TEXT NOT NULL,
      price REAL NOT NULL,
      txnType TEXT NOT NULL,
      txnAmount REAL NOT NULL,
      matched_order_id INTEGER,
      matchScore INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (matched_order_id) REFERENCES orders(id) ON DELETE SET NULL
    )
  `);

  // Create indexes for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_orderId ON orders(orderId);
    CREATE INDEX IF NOT EXISTS idx_transactions_orderId ON transactions(orderId);
    CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
    CREATE INDEX IF NOT EXISTS idx_pending_transactions_status ON pending_transactions(status);
    CREATE INDEX IF NOT EXISTS idx_pending_transactions_matched_order_id ON pending_transactions(matched_order_id);
  `);

  // Create trigger to auto-update updated_at timestamp
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_pending_transactions_timestamp
    AFTER UPDATE ON pending_transactions
    FOR EACH ROW
    BEGIN
      UPDATE pending_transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log('Database initialized successfully');
}

// Initialize on import
initializeDatabase();
