const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  try {
    await conn.query("ALTER TABLE leads ADD COLUMN last_contacted_at TIMESTAMP NULL DEFAULT NULL");
    console.log('Added last_contacted_at column successfully');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column last_contacted_at already exists');
    } else {
      console.error(e);
    }
  }
  await conn.end();
}
run().catch(console.error);
