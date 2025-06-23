export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  hostel: Hostel;
  roomNumber: string;
  avatar?: string;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  itemsSold: number;
  itemsRented: number;
  activeItemsCount?: number;
  isSeller: boolean;
  sellerStatus: 'not_applied' | 'pending' | 'approved' | 'rejected';
  sellerProfile?: {
    availabilityHours?: string;
    profileDescription?: string;
    appliedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Hostel {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  totalRooms: number;
  facilities: string[];
  description?: string;
  university: string;
  isActive: boolean;
  totalUsers: number;
  totalActiveItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  listingType: 'sell' | 'rent';
  price: number;
  rentDuration?: 'hour' | 'day' | 'week' | 'month';
  images: string[];
  seller: User;
  hostel: Hostel;
  status: 'available' | 'sold' | 'rented' | 'reserved';
  tags: string[];
  specifications: Record<string, string>;
  views: number;
  interestedUsers: Array<{
    user: string;
    contactedAt: string;
  }>;
  isPromoted: boolean;
  promotedUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ItemCategory = 
  | 'Electronics'
  | 'Books'
  | 'Furniture'
  | 'Clothing'
  | 'Kitchen'
  | 'Sports'
  | 'Study Materials'
  | 'Appliances'
  | 'Accessories'
  | 'Other';

export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ItemFilters {
  category?: ItemCategory;
  listingType?: 'sell' | 'rent';
  condition?: ItemCondition;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  listingType: 'sell' | 'rent';
  price: number;
  rentDuration?: 'hour' | 'day' | 'week' | 'month';
  images: string[];
  tags?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateUserData {
  name?: string;
  phoneNumber?: string;
  roomNumber?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface SellerApplicationData {
  availabilityHours: string;
  profileDescription?: string;
}

export interface SellerStatusResponse {
  success: boolean;
  data: {
    sellerStatus: 'not_applied' | 'pending' | 'approved' | 'rejected';
    isSeller: boolean;
    sellerProfile: {
      availabilityHours?: string;
      profileDescription?: string;
      appliedAt?: string;
      approvedAt?: string;
      rejectedAt?: string;
      rejectionReason?: string;
    };
  };
}

export interface DashboardAnalytics {
  overview: {
    totalListings: number;
    activeListings: number;
    inactiveListings: number;
    soldItems: number;
    rentedItems: number;
    totalViews: number;
    rating: number;
    totalRatings: number;
  };
  monthlyTransactions: Array<{
    _id: { year: number; month: number };
    count: number;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    _id: string;
    count: number;
    averagePrice: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  recentActivity: Array<{
    _id: string;
    title: string;
    interestedUsers: Array<{
      user: {
        _id: string;
        name: string;
        roomNumber: string;
      };
      contactedAt: string;
    }>;
    createdAt: string;
  }>;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  data: DashboardAnalytics;
} 