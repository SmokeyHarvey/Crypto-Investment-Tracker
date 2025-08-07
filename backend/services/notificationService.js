const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const Investment = require('../models/Investment');
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.initializeScheduledJobs();
  }

  initializeScheduledJobs() {
    // Send daily profit reports at 9:00 AM every day
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily profit report job...');
      await this.sendDailyProfitReports();
    }, {
      timezone: 'UTC'
    });

    // Update prices every 30 minutes during market hours
    cron.schedule('*/30 * * * *', async () => {
      console.log('Running price update job...');
      await this.updateAllPrices();
    }, {
      timezone: 'UTC'
    });

    // Send weekly summary every Sunday at 10:00 AM
    cron.schedule('0 10 * * 0', async () => {
      console.log('Running weekly summary job...');
      await this.sendWeeklySummaries();
    }, {
      timezone: 'UTC'
    });
  }

  async sendDailyProfitReports() {
    try {
      const users = await User.find({
        'notificationPreferences.dailyProfitAlerts': true,
        'notificationPreferences.emailNotifications': true
      });

      for (const user of users) {
        try {
          const portfolioData = await this.getUserPortfolioData(user._id);
          
          if (portfolioData.investments.length > 0) {
            await emailService.sendDailyProfitReport(user, portfolioData);
          }
        } catch (error) {
          console.error(`Error sending daily report to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in daily profit report job:', error);
    }
  }

  async sendWeeklySummaries() {
    try {
      const users = await User.find({
        'notificationPreferences.weeklyReports': true,
        'notificationPreferences.emailNotifications': true
      });

      for (const user of users) {
        try {
          const portfolioData = await this.getUserPortfolioData(user._id);
          
          if (portfolioData.investments.length > 0) {
            await this.sendWeeklySummary(user, portfolioData);
          }
        } catch (error) {
          console.error(`Error sending weekly summary to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in weekly summary job:', error);
    }
  }

  async updateAllPrices() {
    try {
      // Get all unique symbols from all users
      const investments = await Investment.find({ isActive: true });
      const symbols = [...new Set(investments.map(inv => inv.symbol))];
      
      if (symbols.length === 0) return;

      // Fetch current prices from CoinGecko
      const symbolsString = symbols.join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsString}&vs_currencies=usd&include_24hr_change=true`
      );

      // Update each investment with new price data
      for (const investment of investments) {
        const priceData = response.data[investment.symbol];
        if (priceData) {
          investment.updatePriceData(priceData);
          await investment.save();
        }
      }

      console.log(`Updated prices for ${investments.length} investments`);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  async getUserPortfolioData(userId) {
    const investments = await Investment.find({ 
      user: userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalProfit = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

    return {
      totalInvested,
      currentValue,
      totalProfit,
      profitPercentage,
      investments
    };
  }

  async sendWeeklySummary(user, portfolioData) {
    const { totalInvested, currentValue, totalProfit, profitPercentage, investments } = portfolioData;
    
    const profitColor = totalProfit >= 0 ? '#28a745' : '#dc3545';
    const profitSign = totalProfit >= 0 ? '+' : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .profit { color: ${profitColor}; font-weight: bold; font-size: 1.2em; }
          .investment-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Crypto Portfolio Report</h1>
            <p>Hello ${user.name}, here's your weekly investment summary</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h2>Weekly Portfolio Summary</h2>
              <p><strong>Total Invested:</strong> $${totalInvested.toLocaleString()}</p>
              <p><strong>Current Value:</strong> $${currentValue.toLocaleString()}</p>
              <p><strong>Total Profit/Loss:</strong> <span class="profit">${profitSign}$${totalProfit.toLocaleString()}</span></p>
              <p><strong>Profit Percentage:</strong> <span class="profit">${profitSign}${profitPercentage.toFixed(2)}%</span></p>
            </div>
            
            <h3>Your Investments This Week</h3>
            ${investments.map(inv => `
              <div class="investment-item">
                <h4>${inv.name} (${inv.symbol.toUpperCase()})</h4>
                <p><strong>Quantity:</strong> ${inv.quantity}</p>
                <p><strong>Current Price:</strong> $${inv.currentPrice?.toLocaleString() || '0'}</p>
                <p><strong>Current Value:</strong> $${inv.currentValue?.toLocaleString() || '0'}</p>
                <p><strong>Profit/Loss:</strong> <span class="profit">${inv.profit >= 0 ? '+' : ''}$${inv.profit?.toLocaleString() || '0'}</span></p>
                <p><strong>Profit %:</strong> <span class="profit">${inv.profitPercentage >= 0 ? '+' : ''}${inv.profitPercentage?.toFixed(2) || '0'}%</span></p>
                <p><strong>24h Change:</strong> <span class="profit">${inv.priceChange24h >= 0 ? '+' : ''}${inv.priceChange24h?.toFixed(2) || '0'}%</span></p>
              </div>
            `).join('')}
            
            <div class="footer">
              <p>This weekly report was generated automatically by your Crypto Investment Tracker</p>
              <p>You can manage your notification preferences in your account settings</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `📈 Weekly Crypto Report - ${profitSign}$${totalProfit.toLocaleString()} (${profitSign}${profitPercentage.toFixed(2)}%)`,
      html: htmlContent
    };

    try {
      await emailService.transporter.sendMail(mailOptions);
      console.log(`Weekly summary sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }

  // Manual trigger for testing
  async sendTestNotification(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const portfolioData = await this.getUserPortfolioData(userId);
      await emailService.sendDailyProfitReport(user, portfolioData);
      
      return { success: true, message: 'Test notification sent successfully' };
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 