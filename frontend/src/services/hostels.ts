import { Hostel, ApiResponse } from '../types';
import { globalCache } from '../utils/optimizations';
import api from './api';

export interface HostelFilters {
  university?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  search?: string;
}

export interface HostelStats {
  totalHostels: number;
  totalUsers: number;
  totalActiveItems: number;
  universitiesCount: number;
  averageRoomsPerHostel: number;
}

class HostelService {
  private readonly CACHE_TTL = 30; // 30 minutes
  private readonly STATS_CACHE_KEY = 'hostel-stats';
  private readonly UNIVERSITIES_CACHE_KEY = 'universities-list';

  async getHostels(filters?: HostelFilters): Promise<ApiResponse<Hostel[]>> {
    try {
      const cacheKey = `hostels-${JSON.stringify(filters || {})}`;
      const cached = globalCache.get<Hostel[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`/hostels?${params.toString()}`);
      
      if (response.data.success) {
        globalCache.set(cacheKey, response.data.data, this.CACHE_TTL);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching hostels:', error);
      return {
        success: false,
        message: 'Failed to fetch hostels'
      };
    }
  }

  async getHostelById(id: string): Promise<ApiResponse<Hostel>> {
    try {
      const cacheKey = `hostel-${id}`;
      const cached = globalCache.get<Hostel>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const response = await api.get(`/hostels/${id}`);
      
      if (response.data.success) {
        globalCache.set(cacheKey, response.data.data, this.CACHE_TTL);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching hostel:', error);
      return {
        success: false,
        message: 'Failed to fetch hostel details'
      };
    }
  }

  async getUniversities(): Promise<ApiResponse<string[]>> {
    try {
      const cached = globalCache.get<string[]>(this.UNIVERSITIES_CACHE_KEY);
      
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      const response = await api.get('/hostels/universities');
      
      if (response.data.success) {
        globalCache.set(this.UNIVERSITIES_CACHE_KEY, response.data.data, this.CACHE_TTL);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching universities:', error);
      return {
        success: false,
        message: 'Failed to fetch universities'
      };
    }
  }

  invalidateCache(): void {
    globalCache.delete(this.UNIVERSITIES_CACHE_KEY);
    globalCache.delete(this.STATS_CACHE_KEY);
  }
}

export const hostelService = new HostelService();
export default hostelService; 