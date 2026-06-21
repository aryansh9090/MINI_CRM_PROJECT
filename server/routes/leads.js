const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

// ─── Lead Scoring ────────────────────────────────────────────────────────────
const STATUS_SCORES = {
  New: 10,
  Contacted: 25,
  Qualified: 40,
  Converted: 80,
  Lost: 5,
};

const calculateScore = (lead) => {
  let score = STATUS_SCORES[lead.status] || 0;

  // Bonus for non-empty notes
  if (lead.notes && lead.notes.trim().length > 0) score += 10;

  // Bonus for recency
  if (lead.created_at) {
    const now = new Date();
    const created = new Date(lead.created_at);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) score += 15;
    else if (diffDays <= 30) score += 5;
  }

  return score;
};
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET api/leads
// @desc    Get all leads (with computed score field)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.findAll();
    const scoredLeads = leads.map((lead) => ({
      ...lead,
      score: calculateScore(lead),
    }));
    res.json(scoredLeads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/leads
// @desc    Add new lead
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    lead.score = calculateScore(lead);
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/leads/:id
// @desc    Update lead (status, notes, etc.)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const oldStatus = lead.status;

    lead = await Lead.update(req.params.id, req.body);
    lead.score = calculateScore(lead);

    // Auto-log contact attempt if status changed to Contacted or Qualified
    if (req.body.status && req.body.status !== oldStatus && (req.body.status === 'Contacted' || req.body.status === 'Qualified')) {
      const { pool } = require('../config/db');
      const hour_of_day = new Date().getHours();
      await pool.query(
        'INSERT INTO contact_attempts (lead_id, success, hour_of_day) VALUES (?, ?, ?)',
        [req.params.id, true, hour_of_day]
      );
    }

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await Lead.delete(req.params.id);
    res.json({ message: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
