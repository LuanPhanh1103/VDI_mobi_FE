import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axiosClient from 'src/api/axiosClient';
import { User } from '../types/user/User';

interface UserContextType {
  token: string | null;
  userId: string | null;
  username: string | null;
  userDetails: User | null;
  loading: boolean;
  theme: string | null;
  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setUsername: (username: string | null) => void;
  setUserDetails: (user: User | null) => void;
  setTheme: (theme: string | null) => void;
  hasPermission: (permissionName: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<string | null>(localStorage.getItem('flowbite-theme-mode'));

  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !username || !userId) {
        setLoading(false);
        return;
      }

      try {
        const detailUser = await axiosClient.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserDetails(detailUser.data.result);
      } catch (err) {
        console.error('Lỗi khi tải user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, username, userId]);

  const hasPermission = (permissionName: string): boolean => {
    if (!userDetails) return false;
    return userDetails.roles?.some((role) =>
      role.permissions?.some((permission) => permission.name === permissionName),
    );
  };

  return (
    <UserContext.Provider
      value={{
        token,
        userId,
        username,
        userDetails,
        loading,
        theme,
        setToken,
        setUserId,
        setUsername,
        setUserDetails,
        hasPermission,
        setTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ✅ Custom hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser phải được sử dụng trong <UserProvider>');
  }
  return context;
};
