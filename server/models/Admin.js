const { pool } = require('../config/db');

class Admin {
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(username, hashedPassword) {
    const [result] = await pool.query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    return { id: result.insertId, username };
  }
}

module.exports = Admin;
