import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import walletReducer from './walletSlice';
import priceReducer from './priceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    price: priceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
