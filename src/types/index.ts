export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Wallet {
  id: number;
  name: string;
  created_at: string;
  addresses: WalletAddress[];
}

export interface WalletAddress {
  currency: string;
  address: string;
  balance: string;
}

export interface Transaction {
  id?: number;
  wallet_id?: number;
  wallet_address?: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: string;
  currency?: string;
  token_symbol?: string;
  type?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'completed';
  timestamp?: string;
  created_at?: string;
}

export interface Price {
  symbol: string;
  price: string;
  change24h: number;
  lastUpdated?: string;
}

export interface Asset {
  token_symbol: string;
  token_name: string;
  balance: string;
  value_usd?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WalletState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface PriceState {
  prices: Record<string, Price>;
  loading: boolean;
  error: string | null;
}
