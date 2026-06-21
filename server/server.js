require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');

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
