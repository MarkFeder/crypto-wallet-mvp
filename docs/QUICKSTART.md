# 🚀 Quick Start Guide

Get your crypto wallet running in under 5 minutes!

## Prerequisites Checklist

- [ ] Node.js (v16+) installed
- [ ] PostgreSQL (v12+) installed and running
- [ ] Git installed (optional)

## 🎯 Super Quick Setup (3 Commands!)

```bash
# 1. Install dependencies
npm install

# 2. Setup database with test data
npm run setup:db

# 3. Start the app
npm run dev
```

**Done!** 🎉 Open http://localhost:3000

**Login with:**
- Email: `admin@test.com`
- Password: `admin123`

---

## 📋 Detailed Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Install & Start PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install with password: `postgres`
- Or use Docker:
  ```bash
  docker run --name postgres-crypto -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crypto_wallet -p 5432:5432 -d postgres:16
  ```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

### Step 3: Configure Environment

The `.env` file should already exist with default settings:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=crypto_wallet
DB_PASSWORD=postgres
DB_PORT=5432
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

If needed, edit the values to match your PostgreSQL setup.

### Step 4: Setup Database

**Option A - All-in-one (Recommended):**
```bash
npm run setup:db
```
This drops existing tables, recreates schema, and adds test data.

**Option B - Step-by-step:**
```bash
# Test connection
npm run test:db

# Create database manually
createdb -U postgres crypto_wallet

# Initialize schema only
npm run init:db

# Add test data
npm run seed
```

### Step 5: Start Development
```bash
npm run dev
```

The app will start at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎮 Using the App

### Login
Use test credentials:
- **Email**: admin@test.com
- **Password**: admin123

### Explore Features

**View Portfolio:**
- See your total portfolio value
- View assets by currency
- Check real-time prices

**Manage Wallets:**
- Browse "My Main Wallet" and "Trading Wallet"
- View balances across BTC, ETH, USDT, USDC, SOL
- Check transaction history

**Send Transactions:**
- Click "Send" on any currency
- Enter recipient address and amount
- Watch transaction appear in history

**Swap Tokens:**
- Navigate to swap interface
- Select tokens to exchange
- Execute swap with 0.5% fee

### Create New Wallet
- Click "Create Wallet" button
- Name your wallet
- **IMPORTANT**: Save the 12-word recovery phrase!

## 🔧 Development Commands

### Running the App
```bash
npm run dev          # Start both frontend & backend
npm run dev:client   # Frontend only (port 3000)
npm run dev:server   # Backend only (port 5000)
```

### Database Management
```bash
npm run setup:db     # Fresh setup (drop + recreate + seed)
npm run test:db      # Test PostgreSQL connection
npm run init:db      # Create tables only
npm run seed         # Add test data only
npm run reset:db     # Drop & recreate (asks confirmation)
```

### Build & Production
```bash
npm run build        # Build production bundle
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Check for linting issues
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Test if PostgreSQL is running
npm run test:db

# Check PostgreSQL status
# Windows: Check Services for "postgresql"
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Restart PostgreSQL if needed
# Windows: Restart service from Services
# Mac: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows: netstat -ano | findstr :5000, then: taskkill /PID <PID> /F
# Mac/Linux: lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check for errors
npm run type-check

# Rebuild
npm run build
```

## 📁 Project Structure

```
crypto-wallet-mvp/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Portfolio.tsx
│   │   └── WalletDetail.tsx
│   ├── redux/              # Redux store & slices
│   ├── services/           # API & storage services
│   ├── utils/              # Helper functions
│   ├── constants/          # Config & constants
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   ├── server/             # Backend code
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Server utilities
│   │   └── config/         # Database config
│   └── index.tsx           # App entry point
├── scripts/                # Database scripts
├── public/                 # Static assets
└── package.json            # Dependencies
```

## 🔑 Tech Stack

- **Frontend**: React 19, Redux Toolkit, TypeScript
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL
- **Crypto**: ethers.js, bitcoinjs-lib, bip39, bip32
- **Build**: Webpack 5, Babel

## 📚 Next Steps

1. ✅ **Explore the App** - Login and test features
2. 📖 **Read README.md** - Full documentation
3. 🎨 **Customize** - Modify styles and features
4. 🔍 **Learn** - Study the crypto implementation
5. 🚀 **Extend** - Add new features

## 💡 Tips

- Use `npm run setup:db` anytime you want a fresh start
- Test credentials are reset each time you run setup
- Check browser console for useful debug info
- Use Redux DevTools extension for state inspection

## 🆘 Getting Help

- **README.md** - Comprehensive documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **TECH_STACK.md** - Technology explanations
- **Code Comments** - Implementation details

---

⚠️ **Important**: This is a demonstration MVP. Never use with real cryptocurrency without implementing proper security measures!

Happy coding! 🎉
