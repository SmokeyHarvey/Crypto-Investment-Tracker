import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, TrendingUp, TrendingDown, Coins, LogOut } from 'lucide-react';
import './App.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [investments, setInvestments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPortfolio, setTotalPortfolio] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalProfit: 0,
    profitPercentage: 0
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchInvestments();
    } else {
      // Don't automatically show login, let user choose
    }
  }, []);

  // Load investments from API
  const fetchInvestments = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/investments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInvestments(response.data);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
    fetchInvestments();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setInvestments([]);
    setShowLogin(false);
    setShowRegister(false);
  };

  // Fetch live prices for all investments
  const fetchLivePrices = async () => {
    if (investments.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const symbols = investments.map(inv => inv.symbol).join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true`
      );

      const updatedInvestments = investments.map(investment => {
        const priceData = response.data[investment.symbol];
        if (priceData) {
          const currentPrice = priceData.usd;
          const currentValue = investment.quantity * currentPrice;
          const profit = currentValue - investment.investedAmount;
          const profitPercentage = ((profit / investment.investedAmount) * 100);

          return {
            ...investment,
            currentPrice,
            currentValue,
            profit,
            profitPercentage,
            priceChange24h: priceData.usd_24h_change || 0
          };
        } else {
          // If price data is not found, try alternative symbols
          console.log(`No price data found for ${investment.symbol}`);
          return investment;
        }
      });

      setInvestments(updatedInvestments);
      calculatePortfolioTotals(updatedInvestments);
    } catch (err) {
      setError('Failed to fetch live prices. Please try again later.');
      console.error('Error fetching prices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio totals
  const calculatePortfolioTotals = (investmentsList) => {
    const totalInvested = investmentsList.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const currentValue = investmentsList.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalProfit = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

    setTotalPortfolio({
      totalInvested,
      currentValue,
      totalProfit,
      profitPercentage
    });
  };

  // Fetch prices on component mount and every 30 seconds
  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30000);
    return () => clearInterval(interval);
  }, [investments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add new investment
  const addInvestment = async (newInvestment) => {
    try {
      const response = await axios.post('http://localhost:5001/api/investments', newInvestment, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInvestments([...investments, response.data]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding investment:', error);
      setError('Failed to add investment. Please try again.');
    }
  };

  // Remove investment
  const removeInvestment = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/investments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInvestments(investments.filter(inv => inv._id !== id));
    } catch (error) {
      console.error('Error removing investment:', error);
      setError('Failed to remove investment. Please try again.');
    }
  };

  // Update investment
  const updateInvestment = async (id, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/investments/${id}`, updatedData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInvestments(investments.map(inv => 
        inv._id === id ? response.data : inv
      ));
    } catch (error) {
      console.error('Error updating investment:', error);
      setError('Failed to update investment. Please try again.');
    }
  };

  // Show authentication screens
  if (showLogin) {
    return <Login onLogin={handleLogin} />;
  }

  if (showRegister) {
    return <Register onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1><Coins className="header-icon" /> Crypto Investment Tracker</h1>
            <p>Welcome to your crypto investment tracker</p>
          </div>
          <div className="auth-actions">
            <button className="auth-button" onClick={() => setShowLogin(true)}>
              Sign In
            </button>
            <button className="auth-button btn-secondary" onClick={() => setShowRegister(true)}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1><Coins className="header-icon" /> Crypto Investment Tracker</h1>
            <p>Track your crypto assets with live prices and profit calculations</p>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Portfolio Summary */}
      <div className="portfolio-summary card">
        <h2>Portfolio Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Total Invested</h3>
            <p className="amount">${totalPortfolio.totalInvested.toLocaleString()}</p>
          </div>
          <div className="summary-item">
            <h3>Current Value</h3>
            <p className="amount">${totalPortfolio.currentValue.toLocaleString()}</p>
          </div>
          <div className="summary-item">
            <h3>Total Profit/Loss</h3>
            <p className={`amount ${totalPortfolio.totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
              {totalPortfolio.totalProfit >= 0 ? '+' : ''}${totalPortfolio.totalProfit.toLocaleString()}
            </p>
          </div>
          <div className="summary-item">
            <h3>Profit %</h3>
            <p className={`amount ${totalPortfolio.profitPercentage >= 0 ? 'profit-positive' : 'profit-negative'}`}>
              {totalPortfolio.profitPercentage >= 0 ? '+' : ''}{totalPortfolio.profitPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls card">
        <button 
          className="btn" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} />
          {showAddForm ? 'Cancel' : 'Add Investment'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={fetchLivePrices}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Refresh Prices'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error">{error}</div>}

      {/* Add Investment Form */}
      {showAddForm && (
        <AddInvestmentForm 
          onAdd={addInvestment} 
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Symbol Help */}
      {showAddForm && (
        <div className="card">
          <h3>Common Cryptocurrency Symbols</h3>
          <p>Use these CoinGecko IDs for the symbol field:</p>
          <div className="symbol-help">
            <div className="symbol-item">
              <strong>Bitcoin:</strong> bitcoin
            </div>
            <div className="symbol-item">
              <strong>Ethereum:</strong> ethereum
            </div>
            <div className="symbol-item">
              <strong>Polygon:</strong> matic-network
            </div>
            <div className="symbol-item">
              <strong>Cardano:</strong> cardano
            </div>
            <div className="symbol-item">
              <strong>Solana:</strong> solana
            </div>
            <div className="symbol-item">
              <strong>Polkadot:</strong> polkadot
            </div>
            <div className="symbol-item">
              <strong>Chainlink:</strong> chainlink
            </div>
            <div className="symbol-item">
              <strong>Uniswap:</strong> uniswap
            </div>
          </div>
          <p><small>Find more symbols at <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko.com</a></small></p>
        </div>
      )}

      {/* Investments List */}
      <div className="investments-section">
        <h2>Your Investments</h2>
        {investments.length === 0 ? (
          <div className="empty-state card">
            <p>No investments yet. Add your first crypto investment to get started!</p>
          </div>
        ) : (
          <div className="grid">
            {investments.map(investment => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onRemove={removeInvestment}
                onUpdate={updateInvestment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add Investment Form Component
function AddInvestmentForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    quantity: '',
    investedAmount: '',
    purchaseDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search cryptocurrencies
  const searchCryptocurrencies = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
      );
      
      const results = response.data.coins.slice(0, 10).map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        market_cap_rank: coin.market_cap_rank
      }));
      
      setSearchResults(results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching cryptocurrencies:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchCryptocurrencies(query);
  };

  // Handle cryptocurrency selection
  const handleCryptoSelect = (crypto) => {
    setFormData({
      ...formData,
      name: crypto.name,
      symbol: crypto.id
    });
    setSearchQuery(crypto.name);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.symbol || !formData.quantity || !formData.investedAmount) {
      alert('Please fill in all required fields');
      return;
    }

    onAdd({
      name: formData.name,
      symbol: formData.symbol.toLowerCase(),
      quantity: parseFloat(formData.quantity),
      investedAmount: parseFloat(formData.investedAmount),
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0]
    });

    setFormData({
      name: '',
      symbol: '',
      quantity: '',
      investedAmount: '',
      purchaseDate: ''
    });
    setSearchQuery('');
  };

  return (
    <div className="card">
      <h3>Add New Investment</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Search Cryptocurrency *</label>
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for Bitcoin, Ethereum, Polygon..."
              required
              autoComplete="off"
            />
            {isSearching && <div className="search-loading">Searching...</div>}
            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="search-result-item"
                    onClick={() => handleCryptoSelect(crypto)}
                  >
                    <div className="crypto-info">
                      <span className="crypto-name">{crypto.name}</span>
                      <span className="crypto-symbol">{crypto.symbol}</span>
                    </div>
                    {crypto.market_cap_rank && (
                      <span className="market-rank">#{crypto.market_cap_rank}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="input-group">
          <label>Quantity *</label>
          <input
            type="number"
            step="any"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            placeholder="e.g., 0.5"
            required
          />
        </div>
        
        <div className="input-group">
          <label>Amount Invested (USD) *</label>
          <input
            type="number"
            step="any"
            value={formData.investedAmount}
            onChange={(e) => setFormData({...formData, investedAmount: e.target.value})}
            placeholder="e.g., 25000"
            required
          />
        </div>
        
        <div className="input-group">
          <label>Purchase Date</label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn">Add Investment</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// Investment Card Component
function InvestmentCard({ investment, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    quantity: investment.quantity,
    investedAmount: investment.investedAmount
  });

  const handleUpdate = () => {
    onUpdate(investment.id, {
      quantity: parseFloat(editData.quantity),
      investedAmount: parseFloat(editData.investedAmount)
    });
    setIsEditing(false);
  };

  return (
    <div className="investment-card card">
      <div className="investment-header">
        <h3>{investment.name}</h3>
        <div className="investment-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => onRemove(investment.id)}
          >
            Remove
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <div className="input-group">
            <label>Quantity</label>
            <input
              type="number"
              step="any"
              value={editData.quantity}
              onChange={(e) => setEditData({...editData, quantity: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Amount Invested (USD)</label>
            <input
              type="number"
              step="any"
              value={editData.investedAmount}
              onChange={(e) => setEditData({...editData, investedAmount: e.target.value})}
            />
          </div>
          <button className="btn" onClick={handleUpdate}>Save Changes</button>
        </div>
      ) : (
        <div className="investment-details">
          <div className="detail-row">
            <span>Symbol:</span>
            <span className="symbol">{investment.symbol.toUpperCase()}</span>
          </div>
          <div className="detail-row">
            <span>Quantity:</span>
            <span>{investment.quantity}</span>
          </div>
          <div className="detail-row">
            <span>Invested Amount:</span>
            <span>${investment.investedAmount.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Current Price:</span>
            <span>${investment.currentPrice?.toLocaleString() || 'Loading...'}</span>
          </div>
          <div className="detail-row">
            <span>Current Value:</span>
            <span>${investment.currentValue?.toLocaleString() || 'Loading...'}</span>
          </div>
          <div className="detail-row">
            <span>Profit/Loss:</span>
            <span className={investment.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
              {investment.profit >= 0 ? '+' : ''}${investment.profit?.toLocaleString() || 'Loading...'}
            </span>
          </div>
          <div className="detail-row">
            <span>Profit %:</span>
            <span className={investment.profitPercentage >= 0 ? 'profit-positive' : 'profit-negative'}>
              {investment.profitPercentage >= 0 ? '+' : ''}{investment.profitPercentage?.toFixed(2) || '0'}%
            </span>
          </div>
          {investment.priceChange24h !== 0 && (
            <div className="detail-row">
              <span>24h Change:</span>
              <span className={investment.priceChange24h >= 0 ? 'profit-positive' : 'profit-negative'}>
                {investment.priceChange24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {investment.priceChange24h?.toFixed(2) || '0'}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 