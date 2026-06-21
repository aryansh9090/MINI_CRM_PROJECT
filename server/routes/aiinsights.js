const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const auth = require('../middleware/auth');

// @route   POST api/aiinsights/analyze
// @desc    Run Claude deep analysis on leads data (API key stays on server)
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  const { leads } = req.body;

  if (!leads || !Array.isArray(leads)) {
    return res.status(400).json({ message: 'leads array is required in request body' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'AI analysis is not configured on the server (missing ANTHROPIC_API_KEY).' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are a sharp CRM business advisor. Analyze these leads and provide actionable insights.

Leads Data: ${JSON.stringify(leads)}

Respond STRICTLY with a valid JSON object using this exact structure, with no markdown formatting around it:
{
  "pipelineHealth": "Overall summary of the pipeline health (2-3 sentences, be specific with numbers)",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3", "Actionable recommendation 4"],
  "leadsAnalysis": [
    {
      "id": "match the lead id exactly",
      "healthScore": 8,
      "behaviorSummary": "Short 1-line behavior summary",
      "bestTimeToFollowUp": "e.g. Tuesday morning",
      "suggestedAction": "Specific next action, e.g. Send pricing proposal"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }]
    });

    let jsonStr = response.content[0].text.trim();
    // Strip markdown code fences if Claude wraps the JSON
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    res.json(parsed);
  } catch (err) {
    console.error('AI Insights error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to generate AI insights.' });
  }
});

module.exports = router;
