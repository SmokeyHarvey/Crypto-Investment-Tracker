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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET'
    },
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.post('/auth/register', async (req, res) => {
  try {
    res.json({ 
      message: 'Register endpoint working',
      data: req.body,
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in register endpoint' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    res.json({ 
      message: 'Login endpoint working',
      data: req.body,
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login endpoint' });
  }
});

// Investment endpoints
app.get('/investments', async (req, res) => {
  try {
    res.json({ 
      message: 'Get investments endpoint working',
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in get investments endpoint' });
  }
});

app.post('/investments', async (req, res) => {
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

// Catch-all for other API routes
app.all('*', (req, res) => {
  res.json({
    message: 'API endpoint working',
    method: req.method,
    path: req.path,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

module.exports = app; 