const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/investments
// @desc    Get all investments for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ 
      user: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json(investments);
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/investments
// @desc    Add a new investment
// @access  Private
router.post('/', [
  auth,
  body('name', 'Name is required').not().isEmpty(),
  body('symbol', 'Symbol is required').not().isEmpty(),
  body('quantity', 'Quantity must be a positive number').isFloat({ min: 0 }),
  body('investedAmount', 'Invested amount must be a positive number').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, symbol, quantity, investedAmount, purchaseDate, notes } = req.body;

    // Check if investment already exists for this user and symbol
    const existingInvestment = await Investment.findOne({
      user: req.user.id,
      symbol: symbol.toLowerCase(),
      isActive: true
    });

    if (existingInvestment) {
      return res.status(400).json({ 
        message: 'Investment with this symbol already exists. Please update the existing one instead.' 
      });
    }

    const investment = new Investment({
      user: req.user.id,
      name,
      symbol: symbol.toLowerCase(),
      quantity,
      investedAmount,
      purchaseDate: purchaseDate || new Date(),
      notes
    });

    await investment.save();

    // Fetch current price data
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
      );

      const priceData = response.data[symbol.toLowerCase()];
      if (priceData) {
        investment.updatePriceData(priceData);
        await investment.save();
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    }

    res.json(investment);
  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/investments/:id
// @desc    Update an investment
// @access  Private
router.put('/:id', [
  auth,
  body('quantity', 'Quantity must be a positive number').optional().isFloat({ min: 0 }),
  body('investedAmount', 'Invested amount must be a positive number').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const { quantity, investedAmount, notes } = req.body;

    if (quantity !== undefined) investment.quantity = quantity;
    if (investedAmount !== undefined) investment.investedAmount = investedAmount;
    if (notes !== undefined) investment.notes = notes;

    // Recalculate profit/loss if values changed
    if (quantity !== undefined || investedAmount !== undefined) {
      investment.currentValue = investment.quantity * investment.currentPrice;
      investment.profit = investment.currentValue - investment.investedAmount;
      investment.profitPercentage = investment.investedAmount > 0 ? 
        ((investment.profit / investment.investedAmount) * 100) : 0;
    }

    await investment.save();
    res.json(investment);
  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/investments/:id
// @desc    Delete an investment (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investment.isActive = false;
    await investment.save();

    res.json({ message: 'Investment removed' });
  } catch (error) {
    console.error('Delete investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/investments/refresh-prices
// @desc    Refresh prices for all user investments
// @access  Private
router.post('/refresh-prices', auth, async (req, res) => {
  try {
    const investments = await Investment.find({
      user: req.user.id,
      isActive: true
    });

    if (investments.length === 0) {
      return res.json({ message: 'No investments to update' });
    }

    const symbols = investments.map(inv => inv.symbol);
    const symbolsString = symbols.join(',');

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsString}&vs_currencies=usd&include_24hr_change=true`
    );

    const updatedInvestments = [];

    for (const investment of investments) {
      const priceData = response.data[investment.symbol];
      if (priceData) {
        investment.updatePriceData(priceData);
        await investment.save();
        updatedInvestments.push(investment);
      }
    }

    res.json({
      message: `Updated ${updatedInvestments.length} investments`,
      investments: updatedInvestments
    });
  } catch (error) {
    console.error('Refresh prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/investments/portfolio
// @desc    Get portfolio summary for user
// @access  Private
router.get('/portfolio', auth, async (req, res) => {
  try {
    const investments = await Investment.find({
      user: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalProfit = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

    res.json({
      totalInvested,
      currentValue,
      totalProfit,
      profitPercentage,
      investments
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 