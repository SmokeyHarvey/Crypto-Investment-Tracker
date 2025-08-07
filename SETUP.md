# Crypto Investment Tracker - Full Stack Setup Guide

This guide will help you set up the complete Crypto Investment Tracker with user authentication, database storage, and email notifications.

## 🚀 Features

- **User Authentication** with email/password
- **Database Storage** with MongoDB
- **Daily Email Notifications** with profit reports
- **Weekly Summary Reports**
- **Live Price Updates** every 30 minutes
- **Secure API** with JWT authentication
- **Password Reset** functionality
- **Notification Preferences** management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Gmail account for email notifications
- Git

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd crypto-investment-tracker
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. Create a database named `crypto-tracker`

#### Option B: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get your connection string
4. Replace `mongodb://localhost:27017/crypto-tracker` with your Atlas connection string

### 5. Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend` folder:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/crypto-tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crypto-tracker

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CoinGecko API
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration
Create a `.env` file in the root folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Set Up Gmail for Email Notifications

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in your `EMAIL_PASS` environment variable

### 7. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

#### Start Frontend Application
```bash
# In a new terminal, from the root directory
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration Details

### Email Notifications

The app sends three types of email notifications:

1. **Daily Profit Reports** (9:00 AM UTC)
2. **Weekly Summaries** (Sunday 10:00 AM UTC)
3. **Welcome Emails** (on registration)
4. **Password Reset Emails** (on request)

### Scheduled Jobs

The backend runs these automated tasks:

- **Price Updates**: Every 30 minutes
- **Daily Reports**: Every day at 9:00 AM UTC
- **Weekly Reports**: Every Sunday at 10:00 AM UTC

### Security Features

- **JWT Authentication** with 7-day expiration
- **Password Hashing** with bcrypt
- **Rate Limiting** (100 requests per 15 minutes)
- **CORS Protection**
- **Helmet Security Headers**

## 📱 Usage

### 1. Create Account
1. Visit `http://localhost:3000/register`
2. Enter your name, email, and password
3. You'll receive a welcome email

### 2. Add Investments
1. Log in to your account
2. Click "Add Investment"
3. Search for cryptocurrencies (e.g., "Bitcoin", "Ethereum")
4. Enter quantity and invested amount
5. Save your investment

### 3. Manage Notifications
1. Go to your profile settings
2. Toggle notification preferences:
   - Daily profit alerts
   - Weekly reports
   - Email notifications

### 4. View Portfolio
- **Portfolio Summary**: Total invested, current value, profit/loss
- **Individual Investments**: Detailed view with live prices
- **Real-time Updates**: Prices refresh every 30 seconds

## 🧪 Testing

### Test Email Notifications
```bash
# Send a test notification to a user
curl -X POST http://localhost:5000/api/test-notification/USER_ID
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network access (for Atlas)

2. **Email Not Sent**
   - Verify Gmail app password
   - Check spam folder
   - Ensure 2FA is enabled on Gmail

3. **Frontend Can't Connect to Backend**
   - Check if backend is running on port 5000
   - Verify CORS settings
   - Check `REACT_APP_API_URL` in frontend `.env`

4. **Prices Not Loading**
   - Check CoinGecko API status
   - Verify internet connection
   - Check browser console for errors

### Debug Mode

Enable debug logging in backend:
```env
NODE_ENV=development
DEBUG=*
```

## 🔒 Security Notes

1. **Change JWT Secret**: Generate a strong secret for production
2. **Use HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files
4. **Database Security**: Use strong passwords and network restrictions
5. **Email Security**: Use app passwords, not regular passwords

## 📈 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set up proper SSL certificates
4. Configure environment variables on your hosting platform

### Frontend Deployment
1. Build the app: `npm run build`
2. Deploy to hosting service (Netlify, Vercel, etc.)
3. Set production API URL in environment variables

## 📞 Support

If you encounter issues:

1. Check the console logs for errors
2. Verify all environment variables are set
3. Ensure all services are running
4. Check network connectivity

## 🎉 Success!

Once everything is set up, you'll have:

- ✅ User authentication with email/password
- ✅ Secure database storage
- ✅ Daily profit email notifications
- ✅ Live price updates
- ✅ Portfolio management
- ✅ Responsive web interface

Your crypto investment tracker is now ready to use! 🚀 