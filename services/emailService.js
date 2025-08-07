const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendDailyProfitReport(user, portfolioData) {
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
            <h1>📊 Daily Crypto Portfolio Report</h1>
            <p>Hello ${user.name}, here's your daily investment summary</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h2>Portfolio Summary</h2>
              <p><strong>Total Invested:</strong> $${totalInvested.toLocaleString()}</p>
              <p><strong>Current Value:</strong> $${currentValue.toLocaleString()}</p>
              <p><strong>Total Profit/Loss:</strong> <span class="profit">${profitSign}$${totalProfit.toLocaleString()}</span></p>
              <p><strong>Profit Percentage:</strong> <span class="profit">${profitSign}${profitPercentage.toFixed(2)}%</span></p>
            </div>
            
            <h3>Your Investments</h3>
            ${investments.map(inv => `
              <div class="investment-item">
                <h4>${inv.name} (${inv.symbol.toUpperCase()})</h4>
                <p><strong>Quantity:</strong> ${inv.quantity}</p>
                <p><strong>Current Price:</strong> $${inv.currentPrice?.toLocaleString() || '0'}</p>
                <p><strong>Current Value:</strong> $${inv.currentValue?.toLocaleString() || '0'}</p>
                <p><strong>Profit/Loss:</strong> <span class="profit">${inv.profit >= 0 ? '+' : ''}$${inv.profit?.toLocaleString() || '0'}</span></p>
                <p><strong>Profit %:</strong> <span class="profit">${inv.profitPercentage >= 0 ? '+' : ''}${inv.profitPercentage?.toFixed(2) || '0'}%</span></p>
              </div>
            `).join('')}
            
            <div class="footer">
              <p>This report was generated automatically by your Crypto Investment Tracker</p>
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
      subject: `📈 Daily Crypto Report - ${profitSign}$${totalProfit.toLocaleString()} (${profitSign}${profitPercentage.toFixed(2)}%)`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Daily profit report sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending daily profit report:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { background: #f8f9fa; padding: 20px; margin-top: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Crypto Investment Tracker!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Welcome to your personal crypto investment tracker. Here's what you can do:</p>
            <ul>
              <li>📊 Track your cryptocurrency investments with live prices</li>
              <li>💰 Monitor profit/loss in real-time</li>
              <li>📧 Receive daily profit reports via email</li>
              <li>📱 Get push notifications for important updates</li>
            </ul>
            <p>Start by adding your first investment and watch your portfolio grow!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Crypto Investment Tracker! 🚀',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { background: #f8f9fa; padding: 20px; margin-top: 20px; border-radius: 8px; }
          .btn { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>You requested a password reset for your Crypto Investment Tracker account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="btn">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - Crypto Investment Tracker',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 