const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    // We first connect without database to ensure it exists
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    
    try {
      await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
      console.log(`Database '${process.env.DB_NAME}' ready.`);
    } catch (dbCreateErr) {
      // On managed MySQL (e.g. VibeNest), CREATE DATABASE may not be allowed.
      // That's fine — the DB already exists. Just continue.
      console.log(`Note: Could not CREATE DATABASE (managed MySQL). Continuing with existing DB.`);
    }
    await tempPool.end();

    // Now initialize tables using the main pool
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        source VARCHAR(255) DEFAULT 'Website',
        status ENUM('New', 'Contacted', 'Converted') DEFAULT 'New',
        notes TEXT,
        last_contacted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add last_contacted_at if it doesn't exist (fixes already-created production tables)
    await pool.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP NULL DEFAULT NULL;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        contacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT FALSE,
        hour_of_day INT,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      );
    `);

    console.log('Tables initialized successfully.');

    // ─── Auto-seed admin if none exists ──────────────────────────────────────
    const [admins] = await pool.query('SELECT id FROM admins LIMIT 1');
    if (admins.length === 0) {
      const bcrypt = require('bcryptjs');
      const adminPassword = process.env.ADMIN_PASSWORD || 'adminadmin1234';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await pool.query(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('Auto-seeded admin user successfully.');
    } else {
      console.log('Admin user already exists, skipping seed.');
    }
    // ─────────────────────────────────────────────────────────────────────────

  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

module.exports = { pool, initDB };
