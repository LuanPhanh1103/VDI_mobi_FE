import axiosClient from '../api/axiosClient';
import { User } from '../../types/user/User';

export const userService = {
  // Lấy thông tin user theo ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data.result;
  },

  // Cập nhật thông tin user
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await axiosClient.put(`/users/${userId}`, userData);
    return response.data.result;
  },

  // Lấy danh sách users
  getUsers: async (): Promise<User[]> => {
    const response = await axiosClient.get('/users');
    return response.data.result;
  },

  // Tạo user mới
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await axiosClient.post('/users', userData);
    return response.data.result;
  },

  // Xóa user
  deleteUser: async (userId: string): Promise<void> => {
    await axiosClient.delete(`/users/${userId}`);
  },
};
