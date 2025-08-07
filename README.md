# Crypto Investment Tracker

A modern React application that helps you track your cryptocurrency investments with live prices and profit calculations.

## Features

- **Live Price Tracking**: Real-time cryptocurrency prices from CoinGecko API
- **Portfolio Summary**: Overview of total invested amount, current value, and profit/loss
- **Individual Investment Cards**: Detailed view of each investment with profit calculations
- **Add/Edit Investments**: Easy management of your crypto portfolio
- **Local Storage**: Your investments are saved locally in your browser
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Auto-refresh**: Prices update automatically every 30 seconds

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Adding Your First Investment

1. Click the "Add Investment" button
2. Fill in the required information:
   - **Cryptocurrency Name**: The full name (e.g., "Bitcoin", "Ethereum")
   - **Symbol**: The CoinGecko ID (e.g., "bitcoin", "ethereum", "cardano")
   - **Quantity**: How much you own
   - **Amount Invested**: How much you paid in USD
   - **Purchase Date**: When you bought it (optional)

### Understanding the Interface

- **Portfolio Summary**: Shows your total portfolio performance
- **Investment Cards**: Each card shows:
  - Current price and value
  - Profit/loss in dollars and percentage
  - 24-hour price change
  - Edit and remove options

### Supported Cryptocurrencies

The app uses CoinGecko's API, which supports thousands of cryptocurrencies. Use the CoinGecko ID for the symbol field. Common examples:

- Bitcoin: `bitcoin`
- Ethereum: `ethereum`
- Cardano: `cardano`
- Solana: `solana`
- Polkadot: `polkadot`

You can find the correct ID by searching on [CoinGecko](https://coingecko.com).

## Features in Detail

### Live Price Updates
- Prices automatically refresh every 30 seconds
- Manual refresh button available
- Real-time profit/loss calculations

### Portfolio Management
- Add new investments anytime
- Edit existing investments (quantity and invested amount)
- Remove investments you no longer own
- All data saved locally in your browser

### Profit Calculations
- Shows absolute profit/loss in USD
- Displays percentage gain/loss
- Color-coded for easy reading (green for profit, red for loss)

### Responsive Design
- Works on desktop, tablet, and mobile
- Optimized layout for all screen sizes
- Touch-friendly interface

## Technical Details

- **Frontend**: React 18 with functional components and hooks
- **Styling**: CSS with modern design principles
- **API**: CoinGecko API for live cryptocurrency prices
- **Storage**: LocalStorage for persistent data
- **Icons**: Lucide React for beautiful icons

## API Information

This app uses the free CoinGecko API. No API key is required, but please be mindful of rate limits.

## Troubleshooting

### Prices Not Loading
- Check your internet connection
- The CoinGecko API might be temporarily unavailable
- Try clicking the "Refresh Prices" button

### Wrong Symbol Error
- Make sure you're using the correct CoinGecko ID
- Check spelling and case (use lowercase)
- Visit [CoinGecko](https://coingecko.com) to find the correct ID

### Data Not Saving
- Ensure your browser supports localStorage
- Check if you have sufficient storage space
- Try refreshing the page

## Future Enhancements

- Export portfolio data to CSV
- Historical price charts
- Multiple portfolios
- Price alerts
- Dark mode theme
- More detailed analytics

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License. 