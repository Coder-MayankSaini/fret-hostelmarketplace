import { Hostel } from '../types';

// ===== IMAGE COMPRESSION =====
export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export const compressImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const compressMultipleImages = async (
  files: File[],
  options?: ImageCompressionOptions
): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

// ===== LAZY LOADING =====
export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
}

export const createLazyLoader = (options: LazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3C/svg%3E'
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            observer.unobserve(img);
          }
        }
      });
    },
    { threshold, rootMargin }
  );

  return {
    observe: (img: HTMLImageElement) => {
      img.classList.add('lazy-loading');
      img.src = placeholder;
      observer.observe(img);
    },
    disconnect: () => observer.disconnect()
  };
};

// ===== CACHING SYSTEM =====
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    const total = this.cache.size;
    let expired = 0;
    
    this.cache.forEach((value) => {
      if (Date.now() - value.timestamp > value.ttl) {
        expired++;
      }
    });
    
    return {
      total,
      active: total - expired,
      expired
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

// Global cache instance
export const globalCache = new CacheManager();

// ===== HOSTEL DATA LAZY LOADING =====
export interface HostelCacheEntry {
  hostels: Hostel[];
  universities: string[];
  lastUpdated: number;
}

export const hostelCache = {
  CACHE_KEY: 'hostel-data',
  TTL_MINUTES: 30,

  async getHostels(): Promise<Hostel[]> {
    const cached = globalCache.get<HostelCacheEntry>(this.CACHE_KEY);
    
    if (cached) {
      return cached.hostels;
    }
    
    // If not cached, return empty array and trigger background fetch
    this.fetchAndCacheHostels();
    return [];
  },

  async getUniversities(): Promise<string[]> {
    const cached = globalCache.get<HostelCacheEntry>(this.CACHE_KEY);
    
    if (cached) {
      return cached.universities;
    }
    
    // If not cached, return empty array and trigger background fetch
    this.fetchAndCacheHostels();
    return [];
  },

  async fetchAndCacheHostels(): Promise<void> {
    try {
      // This would be replaced with actual API call
      const response = await fetch('/api/hostels');
      const data = await response.json();
      
      if (data.success) {
        const universities: string[] = Array.from(new Set(data.hostels.map((h: Hostel) => h.university)));
        
        const cacheEntry: HostelCacheEntry = {
          hostels: data.hostels,
          universities,
          lastUpdated: Date.now()
        };
        
        globalCache.set(this.CACHE_KEY, cacheEntry, this.TTL_MINUTES);
      }
    } catch (error) {
      console.error('Failed to fetch and cache hostels:', error);
    }
  },

  invalidate(): void {
    globalCache.delete(this.CACHE_KEY);
  }
};

// ===== PERFORMANCE MONITORING =====
export const performanceMonitor = {
  measureTime<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  async measureAsyncTime<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  markInteraction(action: string): void {
    performance.mark(`user-${action}-start`);
  },

  measureInteraction(action: string): void {
    try {
      performance.mark(`user-${action}-end`);
      performance.measure(
        `user-${action}`,
        `user-${action}-start`,
        `user-${action}-end`
      );
      
      const measure = performance.getEntriesByName(`user-${action}`)[0];
      console.log(`👤 User ${action}: ${measure.duration.toFixed(2)}ms`);
    } catch (error) {
      console.warn(`Failed to measure ${action}:`, error);
    }
  }
};

// ===== DEBOUNCE UTILITY =====
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ===== THROTTLE UTILITY =====
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Auto cleanup cache every 5 minutes
setInterval(() => {
  globalCache.cleanup();
}, 5 * 60 * 1000); 