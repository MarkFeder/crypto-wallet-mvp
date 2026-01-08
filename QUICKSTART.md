# 🚀 Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js (v16+) installed
- [ ] PostgreSQL (v12+) installed and running
- [ ] Git installed (optional)

## Setup in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database

**Option A - Automatic (Linux/Mac):**
```bash
./setup-db.sh
```

**Option B - Manual:**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crypto_wallet;
\q

# Initialize schema
psql -U postgres -d crypto_wallet -f server/schema.sql
```

### Step 3: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your PostgreSQL password
# (Default password is 'postgres')
```

### Step 4: Start the Application
```bash
npm start
```

The application will open at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Steps in the App

1. **Register**: Create an account with email/password
2. **Create Wallet**: Click "+" in the sidebar
3. **Save Recovery Phrase**: Write down the 12-word phrase (critical!)
4. **Explore**: View your portfolio and wallet details

## Testing the Features

### Create Multiple Wallets
- Click the "+" button in the sidebar
- Name your wallet (e.g., "Trading", "Savings", "DeFi")
- Save the recovery phrase

### View Portfolio
- Click away from any selected wallet to see portfolio overview
- See total value across all wallets
- View assets by currency

### Mock Transaction
- Select a wallet
- Click "Send" on any currency
- Enter recipient address and amount
- Submit to see transaction in history

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # Mac

# Test connection
psql -U postgres -d crypto_wallet -c "SELECT 1;"
```

### Port Already in Use
```bash
# Backend (5000)
lsof -ti:5000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

```bash
# Start both frontend and backend
npm start

# Run only backend
npm run server

# Run only frontend (dev server)
npm run dev

# Build for production
npm run build
```

## Project Structure Overview

```
crypto-wallet-mvp/
├── src/                    # Frontend React code
│   ├── components/         # UI components
│   ├── redux/             # State management
│   └── App.tsx            # Main app component
├── server/                # Backend Node.js code
│   ├── index.js           # Express server
│   ├── db.js              # Database connection
│   ├── crypto-utils.js    # Crypto operations
│   └── schema.sql         # Database schema
├── public/                # Static files
├── package.json           # Dependencies
├── webpack.config.js      # Build configuration
└── README.md              # Full documentation
```

## Key Technologies Used

- **React + Redux**: Frontend state management
- **TypeScript**: Type safety
- **Node.js + Express**: Backend API
- **PostgreSQL**: Database
- **Webpack + Babel**: Build tools
- **bitcoinjs-lib + ethers.js**: Crypto operations

## Next Steps

1. **Explore the Code**: Check out the component structure
2. **Read the README**: Full documentation available
3. **Customize**: Modify styles, add features
4. **Learn**: Study the crypto wallet implementation

## Getting Help

- Check README.md for detailed documentation
- Review code comments for implementation details
- Examine the Redux slices for state management
- Look at API endpoints in server/index.js

---

**Remember**: This is a demonstration MVP. Never use with real cryptocurrency without proper security measures!

Enjoy building your crypto wallet MVP! 🚀
