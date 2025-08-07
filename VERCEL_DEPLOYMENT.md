# Vercel Deployment Guide

## Environment Variables to Set in Vercel

When deploying to Vercel, you need to set these environment variables in your Vercel dashboard:

### Backend Environment Variables

1. **MONGODB_URI**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/crypto-tracker?retryWrites=true&w=majority
   ```

2. **JWT_SECRET**
   ```
   your-super-secret-jwt-key-change-this-in-production
   ```

3. **EMAIL_HOST**
   ```
   smtp.gmail.com
   ```

4. **EMAIL_PORT**
   ```
   587
   ```

5. **EMAIL_USER**
   ```
   your-email@gmail.com
   ```

6. **EMAIL_PASS**
   ```
   your-app-password
   ```

7. **COINGECKO_API_URL**
   ```
   https://api.coingecko.com/api/v3
   ```

8. **FRONTEND_URL**
   ```
   https://crypto-investment-tracker-mu.vercel.app
   ```

### Frontend Environment Variables

1. **REACT_APP_API_URL**
   ```
   https://crypto-investment-tracker-mu.vercel.app/api
   ```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable with the correct name and value
5. Redeploy your application

## Important Notes

- Replace `your-app-name` with your actual Vercel app name
- Use your actual MongoDB Atlas connection string
- Generate a new JWT secret for production
- Use your actual Gmail credentials
- Make sure to set the environment variables before deploying 