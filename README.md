# CryptoWallet MVP

A full-stack cryptocurrency wallet application featuring multi-currency support, wallet management, token swapping, and real-time portfolio tracking.

## ✨ Features

### Wallet Management
- 🔐 **Create Wallets**: Generate new wallets with BIP39 12-word seed phrases
- 📥 **Multi-Currency Support**: BTC, ETH, USDT, USDC, BNB, SOL, XRP, ADA, DOGE, DOT
- 💼 **Multiple Wallets**: Manage multiple wallets per account
- 📊 **Portfolio Overview**: Real-time total portfolio value across all assets

### Transactions
- 💸 **Send Crypto**: Send transactions to any address
- 🔄 **Token Swapping**: Exchange between cryptocurrencies with 0.5% fee
- 📈 **Transaction History**: View complete transaction history per wallet
- ⏱️ **Real-time Updates**: Live transaction status tracking

### User Experience
- 💱 **Live Price Data**: Real-time cryptocurrency prices with 24h changes
- 🎨 **Modern UI**: Clean, responsive interface with reusable components
- 🔒 **Secure Authentication**: JWT-based auth with bcrypt password hashing
- 📱 **Mobile-Friendly**: Responsive design for all screen sizes

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+)
- **PostgreSQL** (v12+)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone and install
git clone <repository-url>
cd crypto-wallet-mvp
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Setup database with test data (one command!)
npm run setup:db

# 4. Start the application
npm run dev
```

**That's it!** 🎉

Open http://localhost:3000 and login with:
- **Email**: `admin@test.com`
- **Password**: `admin123`

## 📜 Available Scripts

### Development

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Starts both client and server in development mode concurrently |
| `dev:client` | `npm run dev:client` | Starts the webpack dev server for the React frontend (port 3000) |
| `dev:server` | `npm run dev:server` | Starts the Express server with nodemon for hot reloading (port 5000) |

### Build & Production

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `npm run build` | Builds the client for production using webpack |
| `build:client` | `npm run build:client` | Alias for `build` - builds the React frontend |
| `start` | `npm start` | Starts the production server |
| `start:server` | `npm run start:server` | Alias for `start` - runs the Express server |

### Database Setup

| Script | Command | Description |
|--------|---------|-------------|
| `setup:db` | `npm run setup:db` | All-in-one database setup (drop, recreate, migrate, seed) |
| `init:db` | `npm run init:db` | Initializes the database schema |
| `reset:db` | `npm run reset:db` | Drops and recreates all database tables (destructive) |
| `seed` | `npm run seed` | Seeds the database with a test user |
| `test:db` | `npm run test:db` | Tests the database connection |

### Database Migrations

| Script | Command | Description |
|--------|---------|-------------|
| `migrate` | `npm run migrate` | Runs pending database migrations |
| `migrate:up` | `npm run migrate:up` | Applies all pending migrations |
| `migrate:down` | `npm run migrate:down` | Reverts the last migration |
| `migrate:status` | `npm run migrate:status` | Shows the status of all migrations |
| `migrate:dry` | `npm run migrate:dry` | Dry run - shows what migrations would be applied |
| `migrate:create` | `npm run migrate:create` | Creates a new migration file |
| `migrate:mark` | `npm run migrate:mark` | Marks a migration as complete without running it |

### Testing

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `npm test` | Runs all tests using Jest |
| `test:watch` | `npm run test:watch` | Runs tests in watch mode (re-runs on file changes) |
| `test:coverage` | `npm run test:coverage` | Runs tests and generates a coverage report |
| `test:unit` | `npm run test:unit` | Runs only unit tests (tests/unit directory) |
| `test:api` | `npm run test:api` | Runs only API integration tests (tests/api directory) |

### Code Quality

| Script | Command | Description |
|--------|---------|-------------|
| `lint` | `npm run lint` | Runs ESLint on the src directory |
| `lint:fix` | `npm run lint:fix` | Runs ESLint and automatically fixes fixable issues |
| `format` | `npm run format` | Formats code using Prettier |
| `format:check` | `npm run format:check` | Checks if code is properly formatted |
| `type-check` | `npm run type-check` | Runs TypeScript type checking without emitting files |

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **Redux Toolkit** - State management
- **TypeScript** - Type safety
- **Webpack 5** - Module bundler
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Crypto Libraries
- **ethers.js** - Ethereum wallet operations
- **bitcoinjs-lib** - Bitcoin wallet operations
- **bip39** - Mnemonic generation
- **bip32** - HD wallet derivation

## 📁 Project Structure

```
crypto-wallet-mvp/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Portfolio.tsx
│   │   ├── WalletDetail.tsx
│   │   └── ...
│   ├── redux/              # Redux store & slices
│   ├── services/           # API services
│   │   ├── api.ts
│   │   └── storageService.ts
│   ├── utils/              # Utility functions
│   │   ├── calculations.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   ├── constants/          # Configuration
│   │   ├── config.ts
│   │   └── serverConfig.js
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   ├── server/             # Backend
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Server utilities
│   │   ├── queries/        # SQL queries
│   │   └── config/         # Server config
│   └── index.tsx           # App entry point
├── scripts/                # Database scripts
│   ├── setupDatabase.js    # Complete setup
│   ├── seedTestUser.js     # Test data
│   └── testConnection.js   # Connection test
└── public/                 # Static assets
```

## 🗄️ Database Schema

### Tables
- **users** - User accounts with authentication
- **wallets** - User wallets with encrypted mnemonics
- **wallet_addresses** - Multi-currency addresses per wallet
- **transactions** - Transaction history
- **price_cache** - Cryptocurrency price data

## 🔐 Security Features

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Input Validation**: Server & client-side validation
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **Environment Variables**: Sensitive data in .env
- ✅ **Error Handling**: Consistent error responses

⚠️ **Note**: This is an MVP for demonstration. For production:
- Add rate limiting
- Implement HTTPS
- Add 2FA authentication
- Use hardware security modules for key storage
- Implement proper key encryption at rest

## 🎯 Code Quality Improvements

Recent refactoring focused on maintainability:

### Extracted Concerns
- ✅ **Configuration**: Centralized constants and config
- ✅ **API Responses**: Reusable error/success handlers
- ✅ **Storage Service**: Centralized localStorage operations
- ✅ **Calculations**: Safe number parsing and asset value calculations
- ✅ **Business Logic**: Extracted swap service from controllers

### Benefits
- 🔄 Reduced code duplication (100+ lines)
- 📦 Better separation of concerns
- 🧪 More testable code
- 🛡️ Safer number handling (prevents NaN errors)
- 📖 Consistent patterns across codebase

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Test Credentials

After running `npm run setup:db`, use these credentials:

- **Email**: admin@test.com
- **Password**: admin123

**Sample Data Includes:**
- 2 wallets (Main Wallet & Trading Wallet)
- Multiple cryptocurrencies with balances
- Sample transaction history
- Live price data for 10 tokens

## 📄 License

MIT License - This is a demonstration project for educational purposes.
