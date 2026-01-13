import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { storageService } from '../services/storageService';
import { AuthState, AuthResponse } from '../types';
import { API_ENDPOINTS } from '../constants/config';
import { strings } from '../locales';

const initialState: AuthState = {
  user: storageService.getUser(),
  isAuthenticated: storageService.isAuthenticated(),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { username: string; email: string; password: string }) => {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials);
    return response;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
  storageService.clearAuth();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        storageService.setUser(action.payload.user);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.registrationFailed;
      })
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        storageService.setUser(action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || strings.errors.loginFailed;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
