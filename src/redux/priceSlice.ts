import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface PriceData {
  usd: number;
  change_24h: number;
}

interface PriceState {
  prices: {
    [key: string]: PriceData;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PriceState = {
  prices: {},
  loading: false,
  error: null,
};

export const fetchPrices = createAsyncThunk('price/fetchAll', async () => {
  const response = await axios.get(`${API_URL}/prices`);
  return response.data;
});

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.prices = action.payload;
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prices';
      });
  },
});

export default priceSlice.reducer;
