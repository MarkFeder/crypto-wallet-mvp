import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { Price } from '../types';
import { API_ENDPOINTS } from '../constants/config';

interface PriceState {
  prices: Record<string, Price>;
  loading: boolean;
  error: string | null;
}

const initialState: PriceState = {
  prices: {},
  loading: false,
  error: null,
};

export const fetchPrices = createAsyncThunk('price/fetchAll', async () => {
  const response = await apiService.get<{ success: boolean; prices: Price[] }>(
    API_ENDPOINTS.PRICES.BASE
  );

  const priceMap: Record<string, Price> = {};
  response.prices.forEach(price => {
    priceMap[price.symbol] = price;
  });

  return priceMap;
});

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPrices.pending, state => {
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
