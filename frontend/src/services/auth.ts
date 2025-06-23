import api from './api';
import { AuthResponse, UpdateUserData, ChangePasswordData } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  hostel: string;
  roomNumber: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const updateProfile = async (userData: UpdateUserData): Promise<AuthResponse> => {
  try {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const changePassword = async (passwordData: ChangePasswordData): Promise<AuthResponse> => {
  try {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
}; 