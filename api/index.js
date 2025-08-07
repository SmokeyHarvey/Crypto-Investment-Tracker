const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth endpoints
app.post('/auth/register', (req, res) => {
  res.json({ 
    message: 'Register endpoint working',
    data: req.body
  });
});

app.post('/auth/login', (req, res) => {
  res.json({ 
    message: 'Login endpoint working',
    data: req.body
  });
});

// Investment endpoints
app.get('/investments', (req, res) => {
  res.json({ 
    message: 'Get investments endpoint working'
  });
});

app.post('/investments', (req, res) => {
  res.json({ 
    message: 'Add investment endpoint working',
    data: req.body
  });
});

// Catch-all for other API routes
app.all('*', (req, res) => {
  res.json({
    message: 'API endpoint working',
    method: req.method,
    path: req.path
  });
});

module.exports = app; 