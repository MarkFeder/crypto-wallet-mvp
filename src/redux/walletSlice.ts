import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { Wallet, Transaction, WalletState } from '../types';
import { API_ENDPOINTS } from '../constants/config';

interface ExtendedWalletState extends WalletState {
  selectedWallet: Wallet | null;
  transactions: Transaction[];
  mnemonic: string | null;
}

const initialState: ExtendedWalletState = {
  wallets: [],
  selectedWallet: null,
  currentWallet: null,
  transactions: [],
  loading: false,
  error: null,
  mnemonic: null,
};

export const createWallet = createAsyncThunk(
  'wallet/create',
  async (name: string) => {
    const response = await apiService.post<any>(API_ENDPOINTS.WALLETS.BASE, { name });
    return response;
  }
);

export const fetchWallets = createAsyncThunk('wallet/fetchAll', async () => {
  const response = await apiService.get<{ wallets: Wallet[] }>(API_ENDPOINTS.WALLETS.BASE);
  return response.wallets;
});

export const fetchWalletById = createAsyncThunk(
  'wallet/fetchById',
  async (id: number) => {
    const response = await apiService.get<{ wallet: Wallet }>(API_ENDPOINTS.WALLETS.BY_ID(id));
    return response.wallet;
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (walletId: number) => {
    const response = await apiService.get<{ transactions: Transaction[] }>(
      API_ENDPOINTS.WALLETS.TRANSACTIONS(walletId)
    );
    return response.transactions;
  }
);

export const createTransaction = createAsyncThunk(
  'wallet/createTransaction',
  async (txData: {
    walletId: number;
    currency: string;
    type: string;
    amount: number;
    toAddress: string;
  }) => {
    const response = await apiService.post<{ transaction: Transaction }>(
      '/transactions',
      txData
    );
    return response.transaction;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    selectWallet: (state, action) => {
      state.selectedWallet = action.payload;
    },
    clearMnemonic: (state) => {
      state.mnemonic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.mnemonic = action.payload.mnemonic;
        state.wallets.push(action.payload.wallet);
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload;
      })
      .addCase(fetchWalletById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWallet = action.payload;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      });
  },
});

export const { selectWallet, clearMnemonic } = walletSlice.actions;
export default walletSlice.reducer;
