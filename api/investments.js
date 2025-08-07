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

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple investment endpoints for testing
app.get('/', async (req, res) => {
  try {
    res.json({ 
      message: 'Investments endpoint working',
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in investments endpoint' });
  }
});

app.post('/', async (req, res) => {
  try {
    res.json({ 
      message: 'Add investment endpoint working',
      data: req.body,
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in add investment endpoint' });
  }
});

module.exports = app; 