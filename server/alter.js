const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  await conn.query("ALTER TABLE leads MODIFY COLUMN status ENUM('New', 'Contacted', 'Qualified', 'Converted', 'Lost') DEFAULT 'New'");
  console.log('Altered table successfully');
  await conn.end();
}
run().catch(console.error);
