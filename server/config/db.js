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
    
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await tempPool.end();

    console.log(`Database '${process.env.DB_NAME}' ready.`);

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

module.exports = { pool, initDB };
