# Detailed Setup Guide

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be v16+)
node --version

# Check npm version
npm --version

# Check PostgreSQL installation
psql --version
```

## Step-by-Step Setup

### 1. Database Setup

#### Option A: Using psql command line
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crypto_wallet;

# Exit psql
\q
```

#### Option B: Using createdb utility
```bash
createdb -U postgres crypto_wallet
```

### 2. Environment Configuration

```bash
# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and update .env file
```

Update your `.env` file:
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_wallet
DB_USER=postgres
DB_PASSWORD=your_postgres_password

ENCRYPTION_KEY=your_generated_key_here

CLIENT_URL=http://localhost:3000
API_URL=http://localhost:3001/api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database

```bash
npm run init:db
```

You should see:
```
🚀 Initializing database...
✅ Connected to PostgreSQL database
✅ Database tables initialized
✅ Database initialized successfully!
```

### 5. Start the Application

#### Option A: Run Both Servers Separately (Recommended for Development)

Terminal 1:
```bash
npm run dev:server
```
Expected output:
```
🚀 Server running on port 3001
Environment: development
✅ Connected to PostgreSQL database
✅ Price cache updated
```

Terminal 2:
```bash
npm run dev:client
```
Expected output:
```
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:3000/
```

#### Option B: Production Build

```bash
# Build frontend
npm run build

# Start server
npm start
```

### 6. Access the Application

Open your browser and navigate to:
- http://localhost:3000

## Testing the Application

### 1. Create a New Wallet

1. Click "✨ Create New Wallet"
2. **IMPORTANT**: Save your 12-word seed phrase securely
3. Click "I've Saved My Seed Phrase"

### 2. View Portfolio

- See your wallet address in the header
- View your token balances (initially 0)
- Check market prices

### 3. Add Test Balance (For Testing)

Since this is an MVP with simulated blockchain, you can manually add balance via PostgreSQL:

```sql
-- Connect to database
psql -U postgres -d crypto_wallet

-- Add 1 ETH to your wallet (replace YOUR_ADDRESS with your actual address)
UPDATE assets 
SET balance = '1.0', last_updated = CURRENT_TIMESTAMP 
WHERE wallet_address = 'YOUR_ADDRESS' AND token_symbol = 'ETH';

-- Add 0.5 BTC
UPDATE assets 
SET balance = '0.5', last_updated = CURRENT_TIMESTAMP 
WHERE wallet_address = 'YOUR_ADDRESS' AND token_symbol = 'BTC';

-- Add 1000 USDT
UPDATE assets 
SET balance = '1000', last_updated = CURRENT_TIMESTAMP 
WHERE wallet_address = 'YOUR_ADDRESS' AND token_symbol = 'USDT';

-- Exit
\q
```

Refresh the browser to see updated balances.

### 4. Test Send Transaction

1. Navigate to "💸 Send" tab
2. Enter a recipient address (use any valid Ethereum address format)
3. Enter amount
4. Click "Send Transaction"
5. View transaction in "📜 Transactions" tab

### 5. Test Token Swap

1. Navigate to "🔄 Swap" tab
2. Select tokens to swap
3. Enter amount
4. View estimated receive amount
5. Click "Swap Tokens"

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start PostgreSQL:
# macOS (with Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Windows
# Start via Services or pg_ctl
```

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port
# macOS/Linux
lsof -ti:3000
lsof -ti:3001

# Kill process
kill -9 <PID>

# Or change port in .env and webpack.config.js
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Tables Not Created

```bash
# Manually connect and check
psql -U postgres -d crypto_wallet

# List tables
\dt

# If tables missing, run init again
npm run init:db
```

### Frontend Not Loading

```bash
# Clear webpack cache
rm -rf dist node_modules/.cache

# Rebuild
npm run dev:client
```

## Development Tips

### Useful npm Commands

```bash
# Backend development with auto-reload
npm run dev:server

# Frontend development with hot reload
npm run dev:client

# Production build
npm run build

# Initialize/reset database
npm run init:db
```

### Database Queries

```sql
-- View all wallets
SELECT address, created_at FROM wallets;

-- View wallet balances
SELECT wallet_address, token_symbol, balance 
FROM assets 
WHERE wallet_address = 'YOUR_ADDRESS';

-- View transactions
SELECT * FROM transactions 
WHERE wallet_address = 'YOUR_ADDRESS' 
ORDER BY timestamp DESC;

-- View price cache
SELECT * FROM price_cache;
```

### API Testing with curl

```bash
# Get wallet info
curl http://localhost:3001/api/wallet/YOUR_ADDRESS

# Get prices
curl http://localhost:3001/api/prices

# Health check
curl http://localhost:3001/health
```

## Next Steps

1. **Customize**: Modify colors, add features
2. **Deploy**: Consider deploying to Heroku, AWS, or DigitalOcean
3. **Enhance**: Add more tokens, real blockchain integration
4. **Learn**: Study the codebase, understand React+Redux patterns

## Getting Help

- Check error logs in terminal
- Review browser console for frontend errors
- Ensure PostgreSQL is running
- Verify .env configuration
- Check that all dependencies are installed

## Security Reminders

🔐 **Important**: 
- Never commit your `.env` file to Git
- Never share your encryption key
- Always backup seed phrases securely
- This is a demo - don't use for real funds

---

For more information, see [README.md](README.md)
