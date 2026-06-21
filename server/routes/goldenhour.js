const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST api/goldenhour/log
// @desc    Log a contact attempt
// @access  Private
router.post('/log', auth, async (req, res) => {
  try {
    const { lead_id, success } = req.body;
    if (!lead_id) {
      return res.status(400).json({ message: 'lead_id is required' });
    }

    const hour_of_day = new Date().getHours();
    
    await pool.query(
      'INSERT INTO contact_attempts (lead_id, success, hour_of_day) VALUES (?, ?, ?)',
      [lead_id, success || false, hour_of_day]
    );

    res.json({ message: 'Contact attempt logged successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/goldenhour/best-times
// @desc    Analyze all successful contact attempts, return top 3 best hours
// @access  Private
router.get('/best-times', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT hour_of_day, COUNT(*) as success_count
      FROM contact_attempts
      WHERE success = true
      GROUP BY hour_of_day
      ORDER BY success_count DESC
      LIMIT 3
    `);
    
    // Also fetch all hours for the 24 hour heatmap
    const [allHours] = await pool.query(`
      SELECT hour_of_day, COUNT(*) as success_count
      FROM contact_attempts
      WHERE success = true
      GROUP BY hour_of_day
    `);

    res.json({
      topHours: rows,
      allHours: allHours
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/goldenhour/lead/:leadId
// @desc    Get best contact time for a specific lead
// @access  Private
router.get('/lead/:leadId', auth, async (req, res) => {
  try {
    const { leadId } = req.params;
    const [rows] = await pool.query(`
      SELECT hour_of_day, COUNT(*) as success_count
      FROM contact_attempts
      WHERE success = true AND lead_id = ?
      GROUP BY hour_of_day
      ORDER BY success_count DESC
      LIMIT 1
    `, [leadId]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ message: 'No data yet' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
