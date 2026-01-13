/**
 * Centralized strings for localization
 *
 * All user-facing strings should be defined here for easy localization.
 * To add a new language, create a new file (e.g., es.ts) with the same structure.
 */

export const strings = {
  // App-wide
  app: {
    name: 'CryptoVault',
    tagline: 'Your Gateway to Multi-Chain Crypto Management',
  },

  // Common/Shared
  common: {
    loading: 'Loading...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    welcome: 'Welcome',
    logout: 'Logout',
    assets: 'assets',
    unknown: 'UNKNOWN',
    copied: 'Copied!',
    copyToClipboard: 'Copy to Clipboard',
  },

  // Authentication
  auth: {
    signIn: 'Sign In',
    signUp: 'Create Account',
    processing: 'Processing...',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    usernamePlaceholder: 'Enter username',
    emailPlaceholder: 'Enter email',
    passwordPlaceholder: 'Enter password',
    alreadyHaveAccount: 'Already have an account? Sign In',
    dontHaveAccount: "Don't have an account? Register",
    welcomeUser: (username: string) => `Welcome, ${username}!`,
  },

  // Validation
  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    minLength: (min: number) => `Must be at least ${min} characters`,
    invalidFormat: 'Invalid format',
    positiveNumber: 'Must be a positive number',
    fillAllFields: 'Please fill in all fields',
  },

  // Wallet
  wallet: {
    myWallets: 'My Wallets',
    createWallet: 'Create Wallet',
    createNewWallet: 'Create New Wallet',
    walletName: 'Wallet Name',
    walletNamePlaceholder: 'e.g., My Main Wallet',
    walletNameDescription: 'Give your wallet a name to help you identify it.',
    noWalletsYet: 'No wallets yet. Create one!',
    createFirstWallet: 'Create your first wallet to get started!',
    walletId: (id: number) => `Wallet ID: ${id}`,
    addressesAndBalances: 'Addresses & Balances',
    copyAddress: 'Copy Address',
    recoveryPhrase: {
      title: 'Save Your Recovery Phrase',
      warning:
        "Write down these 12 words in order and keep them safe. You'll need them to recover your wallet if you lose access.",
      saved: "I've Saved My Recovery Phrase",
    },
  },

  // Portfolio
  portfolio: {
    overview: 'Portfolio Overview',
    totalValue: 'Total Value',
    totalWallets: 'Total Wallets',
    activeAssets: 'Active Assets',
    assetsByCurrency: 'Assets by Currency',
    loadingPortfolio: 'Loading your portfolio...',
  },

  // Transactions
  transaction: {
    send: 'Send',
    receive: 'Receive',
    sendCurrency: (currency: string) => `Send ${currency}`,
    recipientAddress: 'Recipient Address',
    recipientAddressPlaceholder: 'Enter recipient address',
    amount: 'Amount',
    amountWithCurrency: (currency: string) => `Amount (${currency})`,
    amountPlaceholder: '0.00000000',
    sending: 'Sending...',
    sendTransaction: 'Send Transaction',
    transactionHistory: 'Transaction History',
    noTransactionsYet: 'No transactions yet',
    to: 'To:',
    from: 'From:',
    demoNotice:
      'This is a demo transaction. In production, this would broadcast to the blockchain.',
  },

  // Toast messages
  toast: {
    transactionSuccess: 'Transaction sent successfully!',
    transactionFailed: 'Failed to send transaction',
    walletCreated: 'Wallet created successfully!',
    copied: 'Copied to clipboard!',
  },

  // Errors
  errors: {
    somethingWentWrong: 'Something went wrong',
    unexpectedError: 'An unexpected error occurred',
    tryAgain: 'Try Again',
    reloadPage: 'Reload Page',
    registrationFailed: 'Registration failed',
    loginFailed: 'Login failed',
    failedToCreateWallet: 'Failed to create wallet',
    failedToFetchWallets: 'Failed to fetch wallets',
    failedToFetchWallet: 'Failed to fetch wallet',
    failedToFetchTransactions: 'Failed to fetch transactions',
    failedToCreateTransaction: 'Failed to create transaction',
    mustBeUsedWithinProvider: (hookName: string) =>
      `${hookName} must be used within its Provider`,
  },
} as const;

// Type for the strings object
export type Strings = typeof strings;

// Helper function for future i18n integration
export function t<K extends keyof typeof strings>(
  category: K,
  key: keyof (typeof strings)[K]
): string {
  const value = strings[category][key];
  return typeof value === 'function' ? String(value) : (value as string);
}

export default strings;
