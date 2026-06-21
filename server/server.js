const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');

// ─── Startup Guards ──────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
  process.exit(1);
}
// ANTHROPIC_API_KEY is optional — AI features gracefully degrade if missing
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/goldenhour', require('./routes/goldenhour'));
app.use('/api/conversiondna', require('./routes/conversiondna'));
app.use('/api/aiinsights', require('./routes/aiinsights'));

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React Router fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Initialize DB and start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MySQL:', err);
  });
