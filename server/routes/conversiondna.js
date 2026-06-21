const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

const STOP_WORDS = new Set(['a', 'the', 'is', 'to', 'of', 'and', 'for', 'in', 'it', 'on', 'with', 'as', 'at', 'by', 'an', 'be', 'this', 'that', 'are', 'was', 'or', 'from', 'but', 'not']);

const getProfileData = async () => {
  const [allLeads] = await pool.query('SELECT * FROM leads');
  const convertedLeads = allLeads.filter(l => l.status === 'Converted');
  
  const totalLeads = allLeads.length;
  const totalConverted = convertedLeads.length;
  const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

  if (totalConverted === 0) {
    return {
      hasData: false,
      total_converted: 0,
      conversion_rate: conversionRate
    };
  }

  // 1. Most common source
  const sourceCounts = {};
  convertedLeads.forEach(l => {
    const s = l.source || 'Unknown';
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  });
  let most_common_source = Object.keys(sourceCounts).reduce((a, b) => sourceCounts[a] > sourceCounts[b] ? a : b, 'Website');

  // 2. Avg days to convert
  let totalDays = 0;
  let validDaysCount = 0;
  convertedLeads.forEach(l => {
    if (l.created_at && l.last_contacted_at) {
      const created = new Date(l.created_at);
      const updated = new Date(l.last_contacted_at);
      const diffDays = Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
      validDaysCount++;
    }
  });
  const avg_days_to_convert = validDaysCount > 0 ? Math.round(totalDays / validDaysCount) : 0;

  // 3 & 4. Notes pattern & length
  let leadsWithNotes = 0;
  let totalNotesLength = 0;
  convertedLeads.forEach(l => {
    if (l.notes && l.notes.trim().length > 0) {
      leadsWithNotes++;
      totalNotesLength += l.notes.trim().length;
    }
  });
  const notes_pattern = Math.round((leadsWithNotes / totalConverted) * 100);
  const avg_notes_length = leadsWithNotes > 0 ? Math.round(totalNotesLength / leadsWithNotes) : 0;

  // 5. Best conversion hour
  const hourCounts = {};
  convertedLeads.forEach(l => {
    if (l.last_contacted_at) {
      const h = new Date(l.last_contacted_at).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  });
  let best_conversion_hour = Object.keys(hourCounts).length > 0 
    ? parseInt(Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b))
    : 12;

  // 6. Top keywords
  const wordCounts = {};
  convertedLeads.forEach(l => {
    if (l.notes) {
      const words = l.notes.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      words.forEach(w => {
        if (w && !STOP_WORDS.has(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      });
    }
  });
  const top_keywords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  // 7. Winning traits
  const winning_traits = [
    `Most converted leads came from ${most_common_source}`,
    `${notes_pattern}% of converted leads had detailed notes`,
    `Average conversion takes ${avg_days_to_convert} days`,
    `Best time for final conversion step is around ${best_conversion_hour}:00`
  ];

  return {
    hasData: true,
    most_common_source,
    avg_days_to_convert,
    notes_pattern,
    avg_notes_length,
    best_conversion_hour,
    top_keywords,
    conversion_rate: conversionRate,
    total_converted: totalConverted,
    winning_traits
  };
};

// @route   GET api/conversiondna/profile
// @desc    Get conversion DNA profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await getProfileData();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/conversiondna/score/:leadId
// @desc    Compare specific lead against DNA profile
// @access  Private
router.get('/score/:leadId', auth, async (req, res) => {
  try {
    const profile = await getProfileData();
    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.leadId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const lead = rows[0];

    if (!profile.hasData) {
      return res.json({
        score: 0,
        breakdown: [],
        verdict: 'Needs Nurturing'
      });
    }

    let score = 0;
    const breakdown = [];

    // Source match
    if (lead.source === profile.most_common_source) {
      score += 25;
      breakdown.push({ criteria: 'Source matches most common source', met: true, points: 25 });
    } else {
      breakdown.push({ criteria: 'Source matches most common source', met: false, points: 0 });
    }

    // Has notes
    const hasNotes = lead.notes && lead.notes.trim().length > 0;
    if (hasNotes) {
      score += 20;
      breakdown.push({ criteria: 'Has notes', met: true, points: 20 });
    } else {
      breakdown.push({ criteria: 'Has notes', met: false, points: 0 });
    }

    // Notes length
    if (hasNotes && lead.notes.trim().length >= profile.avg_notes_length) {
      score += 15;
      breakdown.push({ criteria: 'Notes length above average', met: true, points: 15 });
    } else {
      breakdown.push({ criteria: 'Notes length above average', met: false, points: 0 });
    }

    // Lead age
    const created = new Date(lead.created_at);
    const now = new Date();
    const ageDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
    // within avg_days_to_convert range (+3 days leeway)
    if (ageDays <= profile.avg_days_to_convert + 3) {
      score += 20;
      breakdown.push({ criteria: 'Lead age within optimal range', met: true, points: 20 });
    } else {
      breakdown.push({ criteria: 'Lead age within optimal range', met: false, points: 0 });
    }

    // Status
    if (lead.status === 'Qualified' || lead.status === 'Contacted' || lead.status === 'Converted') {
      score += 20;
      breakdown.push({ criteria: 'Status is actively engaged', met: true, points: 20 });
    } else {
      breakdown.push({ criteria: 'Status is actively engaged', met: false, points: 0 });
    }

    // Verdict
    let verdict = 'Needs Nurturing';
    if (score >= 70) verdict = 'High Match';
    else if (score >= 40) verdict = 'Possible Convert';

    res.json({
      score,
      breakdown,
      verdict
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
