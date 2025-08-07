const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://crypto-investment-tracker-mu.vercel.app'] 
    : process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = app; 