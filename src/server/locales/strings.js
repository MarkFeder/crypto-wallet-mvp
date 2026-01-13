/**
 * Server-side strings for localization
 *
 * All server-side user-facing strings should be defined here.
 * This enables easy localization of API responses.
 */

const strings = {
  // Authentication
  auth: {
    allFieldsRequired: 'All fields are required',
    usernameOrEmailExists: 'Username or email already exists',
    registrationFailed: 'Registration failed',
    invalidCredentials: 'Invalid credentials',
    loginFailed: 'Login failed',
    loggedOutSuccessfully: 'Logged out successfully',
    accessTokenRequired: 'Access token required',
    invalidToken: 'Invalid token',
  },

  // Validation - Auth
  validation: {
    auth: {
      usernameMinLength: 'Username must be at least 3 characters',
      usernameMaxLength: 'Username must be at most 30 characters',
      usernameAlphanumeric: 'Username must only contain alphanumeric characters',
      usernameRequired: 'Username is required',
      emailInvalid: 'Please provide a valid email address',
      emailRequired: 'Email is required',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordRequirements:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      passwordRequired: 'Password is required',
    },

    // Validation - Wallet
    wallet: {
      nameEmpty: 'Wallet name cannot be empty',
      nameMaxLength: 'Wallet name must be at most 50 characters',
      nameRequired: 'Wallet name is required',
      idMustBeNumber: 'Wallet ID must be a number',
      idMustBePositive: 'Wallet ID must be positive',
      idRequired: 'Wallet ID is required',
    },

    // Validation - Transaction
    transaction: {
      fromAddressInvalid: 'From address must be a valid Ethereum address',
      fromAddressRequired: 'From address is required',
      toAddressInvalid: 'To address must be a valid Ethereum address',
      toAddressRequired: 'To address is required',
      amountPositive: 'Amount must be greater than 0',
      amountRequired: 'Amount is required',
      tokenInvalid: tokens => `Token must be one of: ${tokens}`,
      tokenRequired: 'Token symbol is required',
      walletAddressInvalid: 'Wallet address must be a valid Ethereum address',
      walletAddressRequired: 'Wallet address is required',
      fromTokenInvalid: tokens => `From token must be one of: ${tokens}`,
      fromTokenRequired: 'From token is required',
      toTokenInvalid: tokens => `To token must be one of: ${tokens}`,
      toTokenRequired: 'To token is required',
      fromAmountRequired: 'From amount is required',
      cannotSwapSameToken: 'Cannot swap to the same token',
      addressInvalid: 'Address must be a valid Ethereum address',
      addressRequired: 'Address is required',
      txHashInvalid: 'Transaction hash must be a valid hex string',
      txHashRequired: 'Transaction hash is required',
    },
  },

  // Wallet operations
  wallet: {
    notFound: 'Wallet not found',
    failedToCreate: 'Failed to create wallet',
    failedToFetch: 'Failed to fetch wallets',
    failedToFetchSingle: 'Failed to fetch wallet',
  },

  // Transaction operations
  transaction: {
    invalidAddressFormat: 'Invalid address format',
    invalidAmount: 'Invalid amount',
    assetNotFound: 'Asset not found in wallet',
    insufficientBalance: 'Insufficient balance',
    insufficientBalanceForSwap: 'Insufficient balance for swap',
    missingRequiredFields: 'Missing required fields',
    notFound: 'Transaction not found',
    failedToSend: 'Failed to send transaction',
    failedToGetHistory: 'Failed to get transaction history',
    failedToGetDetails: 'Failed to get transaction details',
    failedToSwap: 'Failed to swap tokens',
  },

  // Price operations
  price: {
    notFoundForToken: 'Price not found for token',
    failedToGetPrices: 'Failed to get prices',
    failedToGetTokenPrice: 'Failed to get token price',
    failedToGetHistory: 'Failed to get price history',
  },

  // API responses
  api: {
    invalidRequest: 'Invalid request',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    resourceNotFound: 'Resource not found',
    internalServerError: 'Internal server error',
    unexpectedError: 'An unexpected error occurred',
  },

  // Rate limiting
  rateLimit: {
    tooManyLoginAttempts: 'Too many login attempts, please try again after 15 minutes',
    tooManyRequests: 'Too many requests, please slow down',
    tooManyTransactionRequests: 'Too many transaction requests, please wait a moment',
  },
};

module.exports = { strings };
