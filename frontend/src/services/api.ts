import axios, { AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Item API functions
export const createItem = async (itemData: any) => {
  try {
    const response = await api.post('/items', itemData);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const getItems = async (params?: any) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/items?${queryParams}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const getItemById = async (itemId: string) => {
  try {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const updateItem = async (itemId: string, itemData: any) => {
  try {
    const response = await api.put(`/items/${itemId}`, itemData);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const deleteItem = async (itemId: string) => {
  try {
    const response = await api.delete(`/items/${itemId}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

// Peer-to-peer interaction API functions
export const contactSeller = async (itemId: string) => {
  try {
    const response = await api.post(`/items/${itemId}/contact`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const reportUser = async (itemId: string, reason: string, description?: string) => {
  try {
    const response = await api.post(`/items/${itemId}/report`, {
      reason,
      description
    });
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const rateSeller = async (itemId: string, rating: number, review?: string) => {
  try {
    const response = await api.post(`/items/${itemId}/rate`, {
      rating,
      review
    });
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const markItemSold = async (itemId: string) => {
  try {
    const response = await api.patch(`/items/${itemId}/mark-sold`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

// New discovery API functions
export const getDiscoveryFilters = async () => {
  try {
    const response = await api.get('/items/discovery/filters');
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export const searchItems = async (params: {
  search?: string;
  category?: string;
  listingType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  scope?: 'hostel' | 'university';
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    const response = await api.get(`/items?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      message: 'Network error occurred'
    };
  }
};

export default api; 