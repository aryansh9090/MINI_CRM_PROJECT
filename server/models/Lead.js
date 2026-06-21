const { pool } = require('../config/db');

class Lead {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { name, email, source, status, notes } = data;
    const [result] = await pool.query(
      'INSERT INTO leads (name, email, source, status, notes, last_contacted_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, source || 'Website', status || 'New', notes || '']
    );
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.source !== undefined) { fields.push('source = ?'); values.push(data.source); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE leads SET ${fields.join(', ')}, last_contacted_at = NOW() WHERE id = ?`;
    
    await pool.query(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Lead;
