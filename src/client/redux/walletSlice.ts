import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { Wallet, Transaction, WalletState, CreateWalletResponse } from '../../common/types';
import { API_ENDPOINTS } from '../../common/constants/config';
import { strings } from '../locales';

interface ExtendedWalletState extends WalletState {
  selectedWallet: Wallet | null;
  transactions: Transaction[];
  mnemonic: string | null;
  lastFetched: number | null;
}

const initialState: ExtendedWalletState = {
  wallets: [],
  selectedWallet: null,
  currentWallet: null,
  transactions: [],
  loading: false,
  error: null,
  mnemonic: null,
  lastFetched: null,
};

export const createWallet = createAsyncThunk('wallet/create', async (name: string) => {
  const response = await apiService.post<CreateWalletResponse>(API_ENDPOINTS.WALLETS.BASE, {
    name,
  });
  return response;
});

export const fetchWallets = createAsyncThunk('wallet/fetchAll', async () => {
  const response = await apiService.get<{ wallets: Wallet[] }>(API_ENDPOINTS.WALLETS.BASE);
  return response.wallets;
});

export const fetchWalletById = createAsyncThunk('wallet/fetchById', async (id: number) => {
  const response = await apiService.get<{ wallet: Wallet }>(API_ENDPOINTS.WALLETS.BY_ID(id));
  return response.wallet;
});

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
    const response = await apiService.post<{ transaction: Transaction }>('/transactions', txData);
    return response.transaction;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    selectWallet: (state, action: PayloadAction<Wallet>) => {
      state.selectedWallet = action.payload;
    },
    clearMnemonic: state => {
      state.mnemonic = null;
    },
  },
  extraReducers: builder => {
    builder
      // createWallet
      .addCase(createWallet.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.mnemonic = action.payload.mnemonic;
        // Construct wallet with addresses array from the response
        const walletWithAddresses: Wallet = {
          ...action.payload.wallet,
          addresses: Object.entries(action.payload.addresses).map(([currency, address]) => ({
            currency,
            address: address as string,
            balance: '0',
          })),
        };
        state.wallets.push(walletWithAddresses);
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.failedToCreateWallet;
      })
      // fetchWallets
      .addCase(fetchWallets.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.failedToFetchWallets;
      })
      // fetchWalletById
      .addCase(fetchWalletById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWallet = action.payload;
      })
      .addCase(fetchWalletById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.failedToFetchWallet;
      })
      // fetchTransactions
      .addCase(fetchTransactions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.failedToFetchTransactions;
      })
      // createTransaction
      .addCase(createTransaction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.failedToCreateTransaction;
      });
  },
});

export const { selectWallet, clearMnemonic } = walletSlice.actions;
export default walletSlice.reducer;
