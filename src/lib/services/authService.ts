import axiosClient from '../api/axiosClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  userId: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data.result;
  },

  refreshToken: async (token: string): Promise<RefreshTokenResponse> => {
    const response = await axiosClient.post('/auth/refresh', { token });
    return response.data.result;
  },

  logout: async (): Promise<void> => {
    // Có thể gọi API logout nếu backend hỗ trợ
    // await axiosClient.post('/auth/logout');
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await axiosClient.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch {
      return false;
    }
  },
};
