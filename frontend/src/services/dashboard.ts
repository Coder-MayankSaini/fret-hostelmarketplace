import api from './api';
import { ApiResponse, DashboardAnalyticsResponse, PaginatedResponse, Item } from '../types';

export const getDashboardAnalytics = async (): Promise<DashboardAnalyticsResponse> => {
  try {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const getDashboardListings = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Item>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/dashboard/listings?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const toggleListingStatus = async (listingId: string): Promise<ApiResponse> => {
  try {
    const response = await api.patch(`/dashboard/listings/${listingId}/toggle`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
}; 