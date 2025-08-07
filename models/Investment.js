const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    lowercase: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  investedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  profitPercentage: {
    type: Number,
    default: 0
  },
  priceChange24h: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
investmentSchema.index({ user: 1, symbol: 1 });
investmentSchema.index({ user: 1, isActive: 1 });

// Virtual for profit/loss calculation
investmentSchema.virtual('totalProfit').get(function() {
  return this.currentValue - this.investedAmount;
});

// Method to update price data
investmentSchema.methods.updatePriceData = function(priceData) {
  this.currentPrice = priceData.usd || 0;
  this.currentValue = this.quantity * this.currentPrice;
  this.profit = this.currentValue - this.investedAmount;
  this.profitPercentage = this.investedAmount > 0 ? 
    ((this.profit / this.investedAmount) * 100) : 0;
  this.priceChange24h = priceData.usd_24h_change || 0;
  this.lastUpdated = new Date();
  return this;
};

module.exports = mongoose.model('Investment', investmentSchema); 