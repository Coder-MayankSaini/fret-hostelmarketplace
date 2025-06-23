import api from './api';
import { ApiResponse, SellerApplicationData, SellerStatusResponse } from '../types';

export const applyToBeSeller = async (applicationData: SellerApplicationData): Promise<ApiResponse> => {
  try {
    const response = await api.post('/auth/seller/apply', applicationData);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const getSellerStatus = async (): Promise<SellerStatusResponse> => {
  try {
    const response = await api.get('/auth/seller/status');
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const mockApproveSeller = async (): Promise<ApiResponse> => {
  try {
    const response = await api.post('/auth/seller/mock-approve');
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
}; 