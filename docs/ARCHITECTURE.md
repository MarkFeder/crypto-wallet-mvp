# Architecture & Technical Documentation

This document provides detailed explanations of the complex business logic, architectural decisions, and technical implementation details of the Crypto Wallet MVP.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Security Architecture](#security-architecture)
4. [Cryptographic Operations](#cryptographic-operations)
5. [Transaction Processing](#transaction-processing)
6. [Token Swapping Logic](#token-swapping-logic)
7. [State Management](#state-management)
8. [Database Design](#database-design)
9. [API Design Patterns](#api-design-patterns)
10. [Error Handling Strategy](#error-handling-strategy)
11. [Testing Architecture](#testing-architecture)

---

## System Overview

The Crypto Wallet MVP is a full-stack application that simulates cryptocurrency wallet functionality. It follows a client-server architecture with:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │   Redux     │  │   API Service       │  │
│  │ Components  │◄─┤   Store     │◄─┤  (Axios + HttpOnly) │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │ HTTPS
┌───────────────────────────────────────────────┼─────────────┐
│                        SERVER                 ▼              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Rate Limit  │  │    Auth     │  │    Validation       │  │
│  │ Middleware  │─►│ Middleware  │─►│    Middleware       │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
│                                               ▼              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Controllers │◄─┤  Services   │◄─┤   Crypto Utils      │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    PostgreSQL                            ││
│  │  users │ wallets │ wallet_addresses │ transactions       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

The codebase is organized for both local development and Vercel serverless deployment:

```
crypto-wallet-mvp/
├── api/                 # Vercel Serverless Functions (production)
├── src/
│   ├── client/          # Frontend React application
│   ├── common/          # Shared code (types, constants)
│   ├── config/          # Configuration files
│   └── server/          # Backend Express API (local development)
```

### Serverless API Layer (`api/`)

```
api/
├── _lib/                # Shared utilities
│   ├── auth.js          # JWT authentication
│   ├── db.js            # Database connection (Neon PostgreSQL)
│   ├── cors.js          # CORS handling
│   ├── rate-limit.js    # Upstash Redis rate limiting
│   ├── validate.js      # Joi validation
│   └── crypto-utils.js  # BIP39/BIP44 operations
├── auth/                # Authentication endpoints
│   ├── login.js         # POST /api/auth/login
│   ├── register.js      # POST /api/auth/register
│   ├── logout.js        # POST /api/auth/logout
│   └── me.js            # GET /api/auth/me
├── wallets/             # Wallet endpoints
│   ├── index.js         # GET/POST /api/wallets
│   └── [id].js          # GET/DELETE /api/wallets/:id
├── transactions/        # Transaction endpoints
│   ├── index.js         # GET/POST /api/transactions
│   ├── [address].js     # GET /api/transactions/:address
│   └── swap.js          # POST /api/transactions/swap
├── prices/
│   └── index.js         # GET /api/prices
└── health.js            # GET /api/health
```

### Frontend Layer (`src/client/`)

```
src/client/
├── components/           # React UI components
│   ├── ui/              # Reusable primitives (Button, Card, Modal, etc.)
│   ├── ErrorBoundary    # Global error catching
│   └── [Feature].tsx    # Feature-specific components
├── redux/               # State management
│   ├── store.ts         # Redux store configuration
│   ├── authSlice.ts     # Authentication state
│   ├── walletSlice.ts   # Wallet & transaction state
│   └── priceSlice.ts    # Cryptocurrency prices
├── hooks/               # Custom React hooks
│   ├── useToast.ts      # Toast notification management
│   ├── useFormValidation.ts  # Form validation logic
│   └── usePricePolling.ts    # Real-time price updates
├── context/             # React context providers
│   └── ToastContext.tsx # Global toast state
├── services/            # External communication
│   ├── api.ts           # Axios instance with interceptors
│   └── storageService.ts # localStorage abstraction
├── locales/             # Internationalization strings
├── utils/               # Client-side utilities
└── index.tsx            # Application entry point
```

### Shared Layer (`src/common/`)

```
src/common/
├── types/               # TypeScript interfaces shared between client/server
│   └── index.ts         # User, Wallet, Transaction, Price types
└── constants/           # Shared configuration
    ├── config.ts        # TypeScript constants (client)
    └── index.js         # JavaScript constants (server)
```

### Backend Layer (`src/server/`)

```
src/server/
├── controllers/         # Request handlers (thin layer)
├── middleware/          # Request processing pipeline
│   ├── auth.js          # JWT verification from cookies
│   ├── validate.js      # Joi schema validation
│   └── rateLimit.js     # DDoS protection
├── services/            # Business logic layer
│   └── swapService.js   # Token swap operations
├── utils/               # Utility functions
│   ├── crypto-utils.js  # BIP39/BIP44 operations
│   ├── calculations.js  # Safe math operations
│   └── apiResponse.js   # Standardized responses
├── schemas/             # Joi validation schemas
├── queries/             # SQL query definitions
└── locales/             # Server-side strings
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │      │  Server  │      │   JWT    │      │ Database │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ POST /login     │                 │                 │
     │ {email, pass}   │                 │                 │
     │────────────────►│                 │                 │
     │                 │ Query user      │                 │
     │                 │─────────────────────────────────►│
     │                 │                 │    User data    │
     │                 │◄─────────────────────────────────│
     │                 │                 │                 │
     │                 │ Verify bcrypt   │                 │
     │                 │ Sign JWT        │                 │
     │                 │────────────────►│                 │
     │                 │                 │                 │
     │ Set-Cookie:     │                 │                 │
     │ auth_token=JWT  │                 │                 │
     │ (HttpOnly)      │                 │                 │
     │◄────────────────│                 │                 │
```

**Key Security Features:**

| Feature | Implementation | Location |
|---------|---------------|----------|
| Password Storage | bcrypt with salt rounds | `authController.js` |
| Token Storage | HttpOnly cookies (not localStorage) | `auth.js` |
| Token Validation | JWT verification on every request | `auth.js:18-32` |
| Input Validation | Joi schemas for all endpoints | `middleware/validate.js` |
| Rate Limiting | 3 tiers (auth, API, transactions) | `middleware/rateLimit.js` |

### Rate Limiting Strategy

Rate limiting is implemented using Upstash Redis for distributed, serverless-compatible rate limiting:

```javascript
// api/_lib/rate-limit.js

// Authentication endpoints: 5 requests per 60 seconds (brute force protection)
authLimiter: Ratelimit.slidingWindow(5, '60 s')

// General API: 30 requests per 60 seconds
apiLimiter: Ratelimit.slidingWindow(30, '60 s')
```

**Implementation Features:**
- Sliding window algorithm for smooth rate limiting
- IP-based identification via `x-forwarded-for` header
- Graceful degradation when Redis is unavailable
- Rate limit headers in responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

### Cookie Security Configuration

```javascript
// src/server/middleware/auth.js:11-16
const COOKIE_OPTIONS = {
  httpOnly: true,      // Prevents XSS access to token
  secure: true,        // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  maxAge: 86400000,    // 24 hour expiration
};
```

---

## Cryptographic Operations

### Wallet Generation (BIP39/BIP44)

The wallet creation process follows cryptocurrency industry standards:

```
┌─────────────────────────────────────────────────────────────┐
│                    WALLET CREATION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Generate Entropy (128 bits)                             │
│         │                                                    │
│         ▼                                                    │
│  2. BIP39: Entropy → 12-word Mnemonic                       │
│     "abandon ability able about above absent..."            │
│         │                                                    │
│         ▼                                                    │
│  3. BIP39: Mnemonic → Seed (512-bit)                        │
│     Uses PBKDF2 with 2048 iterations                        │
│         │                                                    │
│         ├──────────────────┬─────────────────────┐          │
│         ▼                  ▼                     ▼          │
│  4. BIP44 Derivation  BIP44 Derivation    (other coins)     │
│     m/44'/0'/0'/0/0   m/44'/60'/0'/0/0                      │
│     (Bitcoin)         (Ethereum)                            │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  5. Public Key         Public Key                           │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  6. P2PKH Address      Keccak256 → Address                  │
│     (1xxx or 3xxx)     (0x...)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### BIP44 Derivation Paths

| Coin | Path | Purpose |
|------|------|---------|
| Bitcoin | `m/44'/0'/0'/0/{index}` | Legacy P2PKH addresses |
| Ethereum | `m/44'/60'/0'/0/{index}` | Standard ETH addresses |

**Code Reference:** `src/server/utils/crypto-utils.js`

```javascript
// Bitcoin address derivation (lines 16-33)
function deriveBitcoinAddress(mnemonic, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const path = `m/44'/0'/0'/0/${index}`;
  const child = root.derivePath(path);

  // P2PKH (Pay-to-Public-Key-Hash) address format
  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  return { address, privateKey: child.toWIF() };
}

// Ethereum address derivation (lines 36-48)
function deriveEthereumAddress(mnemonic, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdNode = ethers.HDNodeWallet.fromSeed(seed);
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = hdNode.derivePath(path);

  return { address: wallet.address, privateKey: wallet.privateKey };
}
```

### Why These Standards Matter

1. **BIP39 Mnemonics**: Human-readable backup that can restore all wallet addresses
2. **BIP44 Hierarchical Deterministic (HD)**: Single seed generates unlimited addresses
3. **Deterministic**: Same mnemonic always produces same addresses (critical for recovery)

---

## Transaction Processing

### Send Transaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  TRANSACTION FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client Request                                              │
│  POST /api/transactions/send                                 │
│  { fromAddress, toAddress, amount, tokenSymbol }            │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────┐                │
│  │ 1. VALIDATION                            │                │
│  │    - Joi schema validation               │                │
│  │    - Ethereum address format check       │                │
│  │    - Amount > 0 check                    │                │
│  └────────────────────┬────────────────────┘                │
│                       ▼                                      │
│  ┌─────────────────────────────────────────┐                │
│  │ 2. BALANCE CHECK                         │                │
│  │    - Query wallet_addresses table        │                │
│  │    - Verify sufficient balance           │                │
│  │    - hasSufficientBalance(balance, amt)  │                │
│  └────────────────────┬────────────────────┘                │
│                       ▼                                      │
│  ┌─────────────────────────────────────────┐                │
│  │ 3. TRANSACTION CREATION                  │                │
│  │    - Generate txHash (random 32 bytes)   │                │
│  │    - Insert into transactions table      │                │
│  │    - Status: 'pending'                   │                │
│  └────────────────────┬────────────────────┘                │
│                       ▼                                      │
│  ┌─────────────────────────────────────────┐                │
│  │ 4. BALANCE UPDATE                        │                │
│  │    - Deduct amount from sender           │                │
│  │    - Update wallet_addresses.balance     │                │
│  └────────────────────┬────────────────────┘                │
│                       ▼                                      │
│  ┌─────────────────────────────────────────┐                │
│  │ 5. ASYNC CONFIRMATION (Simulated)        │                │
│  │    - setTimeout (5 seconds)              │                │
│  │    - Update status to 'confirmed'        │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Code Reference:** `src/server/controllers/transactionController.js:17-81`

### Safe Number Handling

Cryptocurrency amounts require precise decimal handling. The codebase uses safe parsing utilities to prevent NaN errors:

```javascript
// src/server/utils/calculations.js

// Safely parse any value to float, with fallback
function safeParseFloat(value, fallback = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

// Check if balance covers amount + optional fee
function hasSufficientBalance(balance, amount, fee = 0) {
  const bal = safeParseFloat(balance);
  const amt = safeParseFloat(amount);
  const f = safeParseFloat(fee);
  return bal >= (amt + f);
}

// Format number to fixed decimals safely
function toFixedSafe(value, decimals = 8) {
  const num = safeParseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
}
```

---

## Token Swapping Logic

### Swap Calculation Algorithm

The token swap feature converts one cryptocurrency to another with a fee:

```
┌─────────────────────────────────────────────────────────────┐
│                    SWAP CALCULATION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: 1 BTC → ETH                                          │
│  BTC Price: $50,000                                          │
│  ETH Price: $2,000                                           │
│  Fee: 0.5%                                                   │
│                                                              │
│  Step 1: Calculate USD value                                 │
│          1 BTC × $50,000 = $50,000                          │
│                                                              │
│  Step 2: Calculate fee                                       │
│          $50,000 × 0.005 = $250                             │
│                                                              │
│  Step 3: Calculate net USD                                   │
│          $50,000 - $250 = $49,750                           │
│                                                              │
│  Step 4: Calculate output amount                             │
│          $49,750 ÷ $2,000 = 24.875 ETH                      │
│                                                              │
│  Result: 1 BTC → 24.875 ETH (fee: $250)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Code Reference:** `src/server/utils/calculations.js`

```javascript
function calculateSwapWithFee(fromAmount, fromPrice, toPrice, feePercentage) {
  const amount = safeParseFloat(fromAmount);
  const valueUSD = amount * safeParseFloat(fromPrice);
  const feeUSD = valueUSD * safeParseFloat(feePercentage);
  const netValueUSD = valueUSD - feeUSD;
  const toAmount = netValueUSD / safeParseFloat(toPrice);

  return { toAmount, feeUSD };
}
```

### Swap Execution Flow

**Code Reference:** `src/server/services/swapService.js`

```javascript
async function executeSwap(walletAddress, fromToken, toToken, fromAmount, toAmount, currentFromBalance) {
  // 1. Deduct from source token
  const newFromBalance = currentFromBalance - safeParseFloat(fromAmount);
  await updateTokenBalance(walletAddress, fromToken, newFromBalance);

  // 2. Add to destination token (create if doesn't exist)
  await createOrUpdateDestinationBalance(walletAddress, toToken, toAmount);
}
```

---

## State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  wallet: {
    wallets: Wallet[],
    selectedWallet: Wallet | null,
    transactions: Transaction[],
    mnemonic: string | null,      // Temporary, cleared after display
    lastFetched: number | null,   // Prevents redundant fetches
    loading: boolean,
    error: string | null
  },
  price: {
    prices: { [symbol: string]: PriceData },
    loading: boolean,
    error: string | null
  }
}
```

### Async Thunk Pattern

All API calls use Redux Toolkit's `createAsyncThunk` for consistent async handling:

```typescript
// src/redux/walletSlice.ts

export const createWallet = createAsyncThunk(
  'wallet/create',
  async (name: string) => {
    const response = await apiService.post<CreateWalletResponse>(
      API_ENDPOINTS.WALLETS.BASE,
      { name }
    );
    return response;
  }
);

// Reducer handles all three states
.addCase(createWallet.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(createWallet.fulfilled, (state, action) => {
  state.loading = false;
  state.mnemonic = action.payload.mnemonic;
  // Transform response to match frontend Wallet type
  const walletWithAddresses: Wallet = {
    ...action.payload.wallet,
    addresses: Object.entries(action.payload.addresses).map(
      ([currency, address]) => ({
        currency,
        address: address as string,
        balance: '0',
      })
    ),
  };
  state.wallets.push(walletWithAddresses);
})
.addCase(createWallet.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message || 'Failed to create wallet';
})
```

### Data Transformation Note

The server returns wallet addresses as an object:
```json
{ "addresses": { "BTC": "1xxx...", "ETH": "0x..." } }
```

The frontend expects an array:
```typescript
{ addresses: [{ currency: "BTC", address: "1xxx...", balance: "0" }] }
```

This transformation happens in the `createWallet.fulfilled` reducer (lines 84-96 of `walletSlice.ts`).

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│   users     │       │   wallets   │       │ wallet_addresses │
├─────────────┤       ├─────────────┤       ├──────────────────┤
│ id (PK)     │◄──────│ user_id (FK)│       │ id (PK)          │
│ username    │   1:N │ id (PK)     │◄──────│ wallet_id (FK)   │
│ email       │       │ name        │   1:N │ currency         │
│ password_   │       │ encrypted_  │       │ address          │
│   hash      │       │   mnemonic  │       │ balance          │
│ created_at  │       │ created_at  │       │ last_updated     │
└─────────────┘       └──────┬──────┘       └──────────────────┘
                             │
                             │ 1:N
                             ▼
                      ┌─────────────┐       ┌──────────────────┐
                      │transactions │       │   price_cache    │
                      ├─────────────┤       ├──────────────────┤
                      │ id (PK)     │       │ id (PK)          │
                      │ wallet_id   │       │ token_symbol (U) │
                      │ currency    │       │ price_usd        │
                      │ type        │       │ change_24h       │
                      │ amount      │       │ last_updated     │
                      │ to_address  │       └──────────────────┘
                      │ from_address│
                      │ tx_hash     │
                      │ status      │
                      │ created_at  │
                      └─────────────┘
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Separate `wallet_addresses` table | Supports multi-currency wallets; each wallet has multiple addresses |
| `encrypted_mnemonic` storage | MVP stores raw mnemonic; production should use proper encryption |
| `DECIMAL(20, 8)` for amounts | Supports up to 20 digits with 8 decimal places (Bitcoin precision) |
| `price_cache` table | Avoids external API calls on every request; updated periodically |
| Cascade deletes | Deleting a user removes all their wallets and transactions |

### Indexes

```sql
CREATE INDEX idx_wallet_user ON wallets(user_id);
CREATE INDEX idx_wallet_addresses_wallet ON wallet_addresses(wallet_id);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_price_cache_symbol ON price_cache(token_symbol);
```

---

## API Design Patterns

### Standardized Response Format

All API responses follow a consistent structure:

```javascript
// Success response
{
  "success": true,
  "data": { ... }  // Spread into response body
}

// Error response
{
  "success": false,
  "error": "Error message"
}
```

**Code Reference:** `src/server/utils/apiResponse.js`

```javascript
const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({ success: true, ...data });
};

const badRequest = (res, message) => {
  return res.status(400).json({ success: false, error: message });
};

const notFound = (res, message) => {
  return res.status(404).json({ success: false, error: message });
};

const serverError = (res, message, error) => {
  console.error(message, error);
  return res.status(500).json({ success: false, error: message });
};
```

### Validation Middleware Pattern

```javascript
// Route definition with validation
app.post(
  '/api/wallets',
  authenticateToken,           // 1. Auth check
  validate(createWalletSchema), // 2. Body validation
  walletController.createWallet // 3. Handler
);

// Validation middleware (src/server/middleware/validate.js)
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // Report all errors, not just first
      stripUnknown: true,   // Remove unexpected fields
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return badRequest(res, messages);
    }

    req.body = value;  // Use sanitized values
    next();
  };
};
```

---

## Error Handling Strategy

### Frontend: Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={...} />;
    }
    return this.props.children;
  }
}
```

### Frontend: Toast Notifications

Instead of `alert()`, the app uses a context-based toast system:

```typescript
// Usage in components
const { showToast } = useToast();

try {
  await dispatch(sendTransaction(data)).unwrap();
  showToast('Transaction sent successfully', 'success');
} catch (error) {
  showToast(error.message, 'error');
}
```

### Backend: Centralized Error Responses

All controllers use the same error response utilities, ensuring consistent error format across the API.

---

## Testing Architecture

### Test Structure

```
tests/
├── setup.js              # Jest configuration, env vars
├── helpers.js            # Test utilities (generateAuthToken, etc.)
├── mocks/
│   └── db.js            # In-memory database mock
├── unit/
│   ├── calculations.test.js   # Math utilities
│   └── crypto-utils.test.js   # BIP39/BIP44 functions
└── api/
    ├── wallet.test.js         # Wallet CRUD endpoints
    └── transaction.test.js    # Transaction endpoints
```

### Mock Database Pattern

The mock database simulates PostgreSQL responses without requiring a real database:

```javascript
// tests/mocks/db.js

const storage = {
  users: [],
  wallets: [],
  wallet_addresses: [],
  transactions: [],
};

const query = jest.fn(async (queryText, params) => {
  const normalizedQuery = queryText.toLowerCase();

  if (normalizedQuery.includes('insert into wallets')) {
    // Simulate INSERT
    const newWallet = { id: ++walletIdCounter, ...data };
    storage.wallets.push(newWallet);
    return { rows: [newWallet], rowCount: 1 };
  }

  if (normalizedQuery.includes('select') && normalizedQuery.includes('wallets')) {
    // Simulate SELECT
    const wallets = storage.wallets.filter(w => w.user_id === params[0]);
    return { rows: wallets, rowCount: wallets.length };
  }

  // ... other query patterns
});
```

### Test Isolation

Each test resets the mock storage to ensure isolation:

```javascript
beforeEach(() => {
  mockDb.resetStorage();
  mockDb.seedTestData(testUser);
  jest.clearAllMocks();
});
```

---

## Performance Considerations

### Price Polling Optimization

```typescript
// src/hooks/usePricePolling.ts

// Only fetch if data is stale (>60 seconds old)
const STALE_THRESHOLD = 60 * 1000;

useEffect(() => {
  const shouldFetch = !lastFetched || Date.now() - lastFetched > STALE_THRESHOLD;

  if (shouldFetch) {
    dispatch(fetchPrices());
  }

  const interval = setInterval(() => {
    dispatch(fetchPrices());
  }, 60000);  // Poll every 60 seconds

  return () => clearInterval(interval);
}, []);
```

### Wallet Fetch Caching

```typescript
// src/redux/walletSlice.ts

// Track last fetch time
state.lastFetched = Date.now();

// Components check staleness before fetching
const CACHE_DURATION = 30000; // 30 seconds
const isStale = !lastFetched || Date.now() - lastFetched > CACHE_DURATION;
if (isStale) {
  dispatch(fetchWallets());
}
```

---

## Localization Architecture

### String Organization

```typescript
// src/locales/strings.ts (Frontend)
export const strings = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
  },
  wallet: {
    createSuccess: 'Wallet created successfully',
    createButton: 'Create Wallet',
  },
  // ...
};

// src/server/locales/strings.js (Backend)
module.exports.strings = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    accessTokenRequired: 'Access token is required',
  },
  transaction: {
    insufficientBalance: 'Insufficient balance',
  },
  // ...
};
```

### Benefits

1. **Single source of truth** for all user-facing text
2. **Easy i18n** - swap string files for different languages
3. **Consistent messaging** across the application
4. **Easier maintenance** - update text without searching code

---

## MVP Limitations & Production Considerations

| Current State | Production Requirement |
|---------------|----------------------|
| Simulated transactions | Real blockchain integration |
| Mnemonic stored as-is | Hardware Security Module (HSM) encryption |
| ✅ Upstash Redis rate limiting | Already implemented |
| ✅ Serverless deployment (Vercel) | Already implemented |
| Basic logging | Structured logging with APM |
| No 2FA | TOTP/WebAuthn authentication |
| ✅ HTTPS/TLS (Vercel) | Already implemented |
| Mock price data | Real exchange API integration |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Vercel     │    │   Vercel     │    │     Upstash      │  │
│  │   CDN/Edge   │───►│  Serverless  │───►│     Redis        │  │
│  │   (Static)   │    │  Functions   │    │  (Rate Limit)    │  │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘  │
│                             │                                    │
│                             ▼                                    │
│                    ┌──────────────────┐                         │
│                    │   Neon PostgreSQL │                         │
│                    │   (Serverless DB) │                         │
│                    └──────────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

Configuration is managed through `src/config/`:

```
src/config/
├── environments/
│   ├── base.js          # Shared settings
│   ├── development.js   # Local development
│   ├── qa.js            # QA testing
│   ├── main.js          # Pre-production
│   └── production.js    # Production
├── .env.example         # Environment template
├── jest.config.js       # Test configuration
├── webpack.config.js    # Build configuration
└── migrate.config.js    # Migration configuration
```

---

## File Reference Index

| File | Purpose |
|------|---------|
| `src/server/utils/crypto-utils.js` | BIP39/BIP44 wallet generation |
| `src/server/controllers/transactionController.js` | Transaction & swap logic |
| `src/server/services/swapService.js` | Token swap execution |
| `src/server/middleware/auth.js` | JWT authentication |
| `src/server/middleware/validate.js` | Joi validation |
| `src/server/middleware/rateLimit.js` | Rate limiting |
| `src/redux/walletSlice.ts` | Wallet state management |
| `src/components/ErrorBoundary.tsx` | Error handling |
| `src/context/ToastContext.tsx` | Notification system |
| `tests/mocks/db.js` | Database mock for testing |
