import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  refreshTokenSuccess
} from '../store/slices/authSlice';
import { clearUserData } from '../store/slices/userSlice';
import { authService } from '../lib/services/authService';
import { isTokenExpiringSoon as checkTokenExpiringSoon, getTokenExpiry } from '../lib/utils/jwt';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    try {
      dispatch(loginStart());

      const response = await authService.login({ username, password });

      // Cập nhật Redux state (Redux Persist sẽ tự động lưu)
      dispatch(loginSuccess({
        token: response.token,
        userId: response.userId,
        username: response.username
      }));

      return response;
    } catch (error) {
      dispatch(loginFailure());
      throw error;
    }
  }, [dispatch]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Redux Persist sẽ tự động clear data
      
      // Clear Redux state
      dispatch(logoutAction());
      dispatch(clearUserData());
    }
  }, [dispatch]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!authState.token) return false;

    try {
      const response = await authService.refreshToken(authState.token);

      // Update Redux state (Redux Persist sẽ tự động lưu)
      dispatch(refreshTokenSuccess({
        token: response.token
      }));

      return true;
    } catch (error) {
      console.error('Refresh token failed:', error);
      logout();
      return false;
    }
  }, [authState.token, dispatch, logout]);

  // Check if token is about to expire (within 5 minutes)
  const isTokenExpiringSoon = useCallback(() => {
    if (!authState.token) return false;
    return checkTokenExpiringSoon(authState.token, 5);
  }, [authState.token]);

  // Get token expiry time
  const getExpiry = useCallback(() => {
    if (!authState.token) return null;
    return getTokenExpiry(authState.token);
  }, [authState.token]);



  return {
    // State
    ...authState,
    
    // Actions
    login,
    logout,
    refreshToken,
    
    // Utilities
    isTokenExpiringSoon,
    getExpiry,
  };
};
