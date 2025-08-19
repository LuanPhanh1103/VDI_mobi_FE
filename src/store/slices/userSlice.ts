import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user/User';

export interface UserState {
  userDetails: User | null;
  theme: string | null;
  loading: boolean;
}

const initialState: UserState = {
  userDetails: null,
  theme: localStorage.getItem('flowbite-theme-mode') || 'light',
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<User | null>) => {
      state.userDetails = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      localStorage.setItem('flowbite-theme-mode', action.payload);
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearUserData: (state) => {
      state.userDetails = null;
      state.loading = false;
    },
    updateUserDetails: (state, action: PayloadAction<Partial<User>>) => {
      if (state.userDetails) {
        state.userDetails = { ...state.userDetails, ...action.payload };
      }
    },
  },
});

export const {
  setUserDetails,
  setTheme,
  setUserLoading,
  clearUserData,
  updateUserDetails,
} = userSlice.actions;

export default userSlice.reducer;
