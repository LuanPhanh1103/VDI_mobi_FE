import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  token: null,
  userId: null,
  username: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<{
      token: string;
      userId: string;
      username: string;
    }>) => {
      state.loading = false;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    loginFailure: (state) => {
      state.loading = false;
      state.token = null;
      state.userId = null;
      state.username = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.username = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    refreshTokenSuccess: (state, action: PayloadAction<{
      token: string;
    }>) => {
      state.token = action.payload.token;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
