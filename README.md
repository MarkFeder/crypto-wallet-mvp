# CryptoWallet MVP

A full-stack cryptocurrency wallet application built with the Exodus tech stack, featuring wallet creation, token swapping, sending/receiving crypto, and portfolio tracking.

## 🎯 Purpose

This project was built as an MVP to demonstrate proficiency with the Exodus technology stack for a job application. It showcases:

- **Frontend**: React + Redux for state management
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL for data persistence
- **Build Tools**: Webpack + Babel
- **Crypto Libraries**: ethers.js, bip39

## ✨ Features

### Core Functionality
- 🔐 **Wallet Creation**: Generate new wallets with 12-word seed phrases
- 📥 **Wallet Import**: Import existing wallets using mnemonic phrases
- 💰 **Portfolio View**: Track multiple tokens (ETH, BTC, USDT) with real-time balances
- 💸 **Send Transactions**: Send crypto to other addresses
- 🔄 **Token Swapping**: Exchange between different cryptocurrencies
- 📊 **Transaction History**: View all past transactions
- 💱 **Live Prices**: Real-time cryptocurrency price tracking

### Security Features
- 🔒 AES-256-GCM encryption for private keys and mnemonics
- 🛡️ Helmet.js for HTTP security headers
- ⏱️ Rate limiting to prevent abuse
- 🔑 Client-side seed phrase storage

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Setup PostgreSQL Database**
```bash
# Create database
createdb crypto_wallet

# Or using psql
psql -U postgres
CREATE DATABASE crypto_wallet;
```

3. **Configure Environment Variables**
```bash
# Copy the example env file
cp .env.example .env

# Generate an encryption key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with your settings
```

4. **Initialize Database Tables**
```bash
npm run init:db
```

5. **Start Development Servers**

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev:client
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Tech Stack Alignment with Exodus

Based on the Exodus Senior Software Engineer job posting:

### Required Technologies
✅ **JavaScript/Node.js** - Backend API and server
✅ **React** - Frontend UI components
✅ **Redux** - State management
✅ **PostgreSQL** - Primary database
✅ **Webpack** - Build tooling and bundling
✅ **Babel** - JavaScript transpilation
✅ **NPM** - Package management

### Plus Points Demonstrated
✅ **Cryptographic protocols** - Wallet generation, key management
✅ **Security** - Encryption, secure storage
✅ **Performance** - Efficient state updates

## 📚 Project Structure

```
crypto-wallet-mvp/
├── src/
│   ├── client/              # React frontend
│   │   ├── components/      # React components
│   │   ├── redux/          # Redux state management
│   │   └── styles/         # CSS styles
│   └── server/             # Node.js backend
│       ├── config/         # Database config
│       ├── controllers/    # Business logic
│       └── routes/         # API routes
├── public/                 # Static files
├── scripts/               # Utility scripts
└── package.json           # Dependencies

```

## 🔐 Security Notes

⚠️ **This is an MVP for demonstration purposes**

- Private keys are encrypted but stored in the database
- Seed phrases should never be transmitted over network
- Add 2FA and additional authentication layers for production
- Use environment-specific encryption keys

## 🚧 Future Enhancements

- Add support for more cryptocurrencies
- Integrate with real blockchain networks
- Implement hardware wallet support
- Add DApp browser functionality
- Implement NFT support
- Create mobile app (React Native)

## 👨‍💻 About This Project

Created as a technical demonstration for the Exodus Senior Software Engineer position using the same tech stack mentioned in the job description.

## 📄 License

MIT License - This is a demonstration project for educational purposes.
