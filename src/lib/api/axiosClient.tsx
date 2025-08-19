import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../../store';
import { logout, refreshTokenSuccess } from '../../store/slices/authSlice';
import { authService } from '../services/authService';
import { isTokenExpired } from '../utils/jwt';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/vdi_mobifone`,
});

// Flag để tránh multiple refresh calls
let isRefreshing = false;

// Request interceptor - Tự động thêm token vào header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý refresh token khi 401
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đang refresh token, từ chối request
      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      const state = store.getState();
      const currentToken = state.auth.token;

      if (currentToken && !isTokenExpired(currentToken)) {
        try {
          // Gọi API refresh token
          const refreshResponse = await authService.refreshToken(currentToken);
          const newToken = refreshResponse.token;

          // Cập nhật token trong store (Redux Persist sẽ tự động lưu)
          store.dispatch(refreshTokenSuccess({
            token: newToken
          }));

          // Retry original request với token mới
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return axiosClient(originalRequest);
        } catch (refreshError) {
          // Refresh token thất bại - logout user
          store.dispatch(logout());
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

          // Redirect to login
          window.location.href = '/auth/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có token hoặc token đã hết hạn - logout
        store.dispatch(logout());
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
