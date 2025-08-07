const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const investmentRoutes = require('../backend/routes/investments');
const auth = require('../backend/middleware/auth');

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Auth middleware for all routes
app.use(auth);

// Routes
app.use('/', investmentRoutes);

module.exports = app; 