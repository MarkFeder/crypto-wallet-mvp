import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Address {
  currency: string;
  address: string;
  balance: string;
}

interface Wallet {
  id: number;
  name: string;
  created_at: string;
  addresses: Address[];
}

interface Transaction {
  id: number;
  currency: string;
  type: string;
  amount: string;
  to_address: string;
  from_address: string;
  status: string;
  created_at: string;
}

interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  mnemonic: string | null;
}

const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  transactions: [],
  loading: false,
  error: null,
  mnemonic: null,
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createWallet = createAsyncThunk(
  'wallet/create',
  async (name: string) => {
    const response = await axios.post(
      `${API_URL}/wallets`,
      { name },
      getAuthHeader()
    );
    return response.data;
  }
);

export const fetchWallets = createAsyncThunk('wallet/fetchAll', async () => {
  const response = await axios.get(`${API_URL}/wallets`, getAuthHeader());
  return response.data.wallets;
});

export const fetchWalletById = createAsyncThunk(
  'wallet/fetchById',
  async (id: number) => {
    const response = await axios.get(`${API_URL}/wallets/${id}`, getAuthHeader());
    return response.data.wallet;
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (walletId: number) => {
    const response = await axios.get(
      `${API_URL}/wallets/${walletId}/transactions`,
      getAuthHeader()
    );
    return response.data.transactions;
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
    const response = await axios.post(
      `${API_URL}/transactions`,
      txData,
      getAuthHeader()
    );
    return response.data.transaction;
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
