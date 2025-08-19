import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { useAuth } from './useAuth';
import { 
  setUserDetails, 
  setTheme, 
  setUserLoading, 
  updateUserDetails 
} from '../store/slices/userSlice';
import { userService } from '../lib/services/userService';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);
  const { token, userId, username, isAuthenticated } = useAuth();

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    if (!userId || !token || !isAuthenticated) {
      return;
    }

    try {
      dispatch(setUserLoading(true));
      const userDetails = await userService.getUserById(userId);
      dispatch(setUserDetails(userDetails));
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      dispatch(setUserLoading(false));
    }
  }, [userId, token, isAuthenticated, dispatch]);

  // Update theme
  const updateTheme = useCallback((theme: string) => {
    dispatch(setTheme(theme));
  }, [dispatch]);

  // Update user details
  const updateUser = useCallback(async (userData: Partial<any>) => {
    if (!userId) return;

    try {
      dispatch(setUserLoading(true));
      const updatedUser = await userService.updateUser(userId, userData);
      dispatch(updateUserDetails(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      dispatch(setUserLoading(false));
    }
  }, [userId, dispatch]);

  // Check if user has permission
  const hasPermission = useCallback((permissionName: string): boolean => {
    if (!userState.userDetails) return false;
    return userState.userDetails.roles?.some((role) =>
      role.permissions?.some((permission) => permission.name === permissionName),
    ) || false;
  }, [userState.userDetails]);

  // Auto fetch user details when authenticated
  useEffect(() => {
    if (isAuthenticated && userId && !userState.userDetails) {
      fetchUserDetails();
    }
  }, [isAuthenticated, userId, userState.userDetails, fetchUserDetails]);

  return {
    // State
    userDetails: userState.userDetails,
    theme: userState.theme,
    loading: userState.loading,
    
    // Auth info
    token,
    userId,
    username,
    isAuthenticated,
    
    // Actions
    fetchUserDetails,
    updateTheme,
    setTheme: updateTheme, // Alias for backward compatibility
    updateUser,
    
    // Utilities
    hasPermission,
  };
};
