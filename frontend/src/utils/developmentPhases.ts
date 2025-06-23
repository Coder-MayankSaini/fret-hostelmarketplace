// Development Phases for Fretio Interhostel Marketplace

export interface PhaseFeature {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'testing' | 'deployed';
  dependencies?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: string;
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  features: PhaseFeature[];
  startDate?: string;
  endDate?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
}

// Phase 1: Auth System + User Profiles
export const phase1: DevelopmentPhase = {
  id: 'phase-1',
  name: 'Authentication & User Management',
  description: 'Complete user authentication system with profile management',
  status: 'completed',
  completionPercentage: 100,
  features: [
    {
      id: 'auth-register',
      name: 'User Registration',
      description: 'Email/password registration with hostel selection',
      status: 'completed',
      estimatedHours: 8,
      actualHours: 10,
      completedAt: '2024-01-15'
    },
    {
      id: 'auth-login',
      name: 'User Login',
      description: 'JWT-based authentication with persistent sessions',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 7,
      completedAt: '2024-01-16'
    },
    {
      id: 'user-profile',
      name: 'User Profiles',
      description: 'Profile creation, editing, and avatar upload',
      status: 'completed',
      estimatedHours: 12,
      actualHours: 15,
      completedAt: '2024-01-18'
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      description: 'Email-based password recovery system',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 8,
      completedAt: '2024-01-19'
    },
    {
      id: 'profile-verification',
      name: 'Profile Verification',
      description: 'Room number and hostel verification process',
      status: 'completed',
      estimatedHours: 10,
      actualHours: 12,
      completedAt: '2024-01-20'
    }
  ]
};

// Phase 2: Seller Dashboard + Listing CRUD
export const phase2: DevelopmentPhase = {
  id: 'phase-2',
  name: 'Seller Dashboard & Listing Management',
  description: 'Complete seller registration, dashboard analytics, and item listing system',
  status: 'completed',
  completionPercentage: 100,
  features: [
    {
      id: 'seller-application',
      name: 'Seller Application System',
      description: 'Application form for becoming a verified seller',
      status: 'completed',
      estimatedHours: 8,
      actualHours: 10,
      completedAt: '2024-01-25'
    },
    {
      id: 'seller-approval',
      name: 'Seller Approval Workflow',
      description: 'Admin approval system with mock approval for MVP',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 8,
      completedAt: '2024-01-26'
    },
    {
      id: 'dashboard-analytics',
      name: 'Dashboard Analytics',
      description: 'Comprehensive analytics with charts and statistics',
      status: 'completed',
      dependencies: ['seller-approval'],
      estimatedHours: 15,
      actualHours: 20,
      completedAt: '2024-01-30'
    },
    {
      id: 'listing-create',
      name: 'Create Listings',
      description: 'Advanced listing form with image upload and rich features',
      status: 'completed',
      estimatedHours: 12,
      actualHours: 18,
      completedAt: '2024-02-02'
    },
    {
      id: 'listing-management',
      name: 'Listing Management',
      description: 'Edit, delete, toggle status of listings',
      status: 'completed',
      dependencies: ['listing-create'],
      estimatedHours: 10,
      actualHours: 12,
      completedAt: '2024-02-05'
    },
    {
      id: 'dashboard-ui',
      name: 'Dashboard UI/UX',
      description: 'Responsive dashboard with university themes',
      status: 'completed',
      estimatedHours: 16,
      actualHours: 22,
      completedAt: '2024-02-08'
    }
  ]
};

// Phase 3: Hostel Filtering + Discovery Feed
export const phase3: DevelopmentPhase = {
  id: 'phase-3',
  name: 'Discovery & Filtering System',
  description: 'Smart hostel-based filtering and discovery algorithms',
  status: 'completed',
  completionPercentage: 100,
  features: [
    {
      id: 'hostel-detection',
      name: 'Hostel Detection',
      description: 'Automatic hostel detection from user profile',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 8,
      completedAt: '2024-02-10'
    },
    {
      id: 'discovery-algorithm',
      name: 'Discovery Algorithm',
      description: 'Smart filtering: hostel → university → all',
      status: 'completed',
      dependencies: ['hostel-detection'],
      estimatedHours: 12,
      actualHours: 16,
      completedAt: '2024-02-12'
    },
    {
      id: 'advanced-filters',
      name: 'Advanced Filters',
      description: 'Category, price, condition, and type filters',
      status: 'completed',
      estimatedHours: 10,
      actualHours: 14,
      completedAt: '2024-02-14'
    },
    {
      id: 'search-functionality',
      name: 'Search Functionality',
      description: 'Real-time search with debouncing',
      status: 'completed',
      estimatedHours: 8,
      actualHours: 10,
      completedAt: '2024-02-15'
    },
    {
      id: 'discovery-ui',
      name: 'Discovery UI',
      description: 'Grid/list views, scope toggles, filter panels',
      status: 'completed',
      estimatedHours: 14,
      actualHours: 18,
      completedAt: '2024-02-18'
    },
    {
      id: 'empty-states',
      name: 'Empty States',
      description: 'Illustrated empty states for various scenarios',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 8,
      completedAt: '2024-02-19'
    }
  ]
};

// Phase 4: Rating System + Admin Controls
export const phase4: DevelopmentPhase = {
  id: 'phase-4',
  name: 'Rating System & User Interactions',
  description: 'Peer-to-peer interactions, ratings, and safety features',
  status: 'completed',
  completionPercentage: 100,
  features: [
    {
      id: 'item-details',
      name: 'Item Detail Pages',
      description: 'Comprehensive item view with seller information',
      status: 'completed',
      estimatedHours: 10,
      actualHours: 12,
      completedAt: '2024-02-22'
    },
    {
      id: 'seller-contact',
      name: 'Seller Contact System',
      description: 'Reveal phone numbers with hostel verification',
      status: 'completed',
      dependencies: ['item-details'],
      estimatedHours: 8,
      actualHours: 10,
      completedAt: '2024-02-24'
    },
    {
      id: 'rating-system',
      name: 'Rating & Review System',
      description: '5-star rating system with written reviews',
      status: 'completed',
      estimatedHours: 12,
      actualHours: 15,
      completedAt: '2024-02-26'
    },
    {
      id: 'report-system',
      name: 'User Reporting System',
      description: 'Report users for various safety reasons',
      status: 'completed',
      estimatedHours: 8,
      actualHours: 10,
      completedAt: '2024-02-27'
    },
    {
      id: 'transaction-tracking',
      name: 'Transaction Tracking',
      description: 'Mark items as sold/rented with verification',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 8,
      completedAt: '2024-02-28'
    },
    {
      id: 'safety-features',
      name: 'Safety Features',
      description: 'Privacy protection and security measures',
      status: 'completed',
      estimatedHours: 10,
      actualHours: 12,
      completedAt: '2024-03-01'
    }
  ]
};

// All phases
export const allPhases: DevelopmentPhase[] = [phase1, phase2, phase3, phase4];

// Utility functions
export const getPhaseProgress = (phase: DevelopmentPhase): number => {
  if (phase.features.length === 0) return 0;
  
  const completedFeatures = phase.features.filter(f => f.status === 'completed').length;
  return Math.round((completedFeatures / phase.features.length) * 100);
};

export const getTotalProgress = (): number => {
  const totalFeatures = allPhases.reduce((sum, phase) => sum + phase.features.length, 0);
  const completedFeatures = allPhases.reduce(
    (sum, phase) => sum + phase.features.filter(f => f.status === 'completed').length,
    0
  );
  
  return Math.round((completedFeatures / totalFeatures) * 100);
};

export const getPhaseById = (id: string): DevelopmentPhase | undefined => {
  return allPhases.find(phase => phase.id === id);
};

export const getFeatureById = (featureId: string): PhaseFeature | undefined => {
  for (const phase of allPhases) {
    const feature = phase.features.find(f => f.id === featureId);
    if (feature) return feature;
  }
  return undefined;
};

export const getNextPhase = (): DevelopmentPhase | null => {
  const nextPhase = allPhases.find(phase => phase.status !== 'completed');
  return nextPhase || null;
};

export const getProjectStats = () => {
  const totalFeatures = allPhases.reduce((sum, phase) => sum + phase.features.length, 0);
  const completedFeatures = allPhases.reduce(
    (sum, phase) => sum + phase.features.filter(f => f.status === 'completed').length,
    0
  );
  const estimatedHours = allPhases.reduce(
    (sum, phase) => sum + phase.features.reduce((phaseSum, feature) => phaseSum + (feature.estimatedHours || 0), 0),
    0
  );
  const actualHours = allPhases.reduce(
    (sum, phase) => sum + phase.features.reduce((phaseSum, feature) => phaseSum + (feature.actualHours || 0), 0),
    0
  );

  return {
    totalPhases: allPhases.length,
    completedPhases: allPhases.filter(p => p.status === 'completed').length,
    totalFeatures,
    completedFeatures,
    completionPercentage: Math.round((completedFeatures / totalFeatures) * 100),
    estimatedHours,
    actualHours,
    efficiencyRatio: estimatedHours > 0 ? Math.round((estimatedHours / actualHours) * 100) : 100
  };
};

// Feature flags for development
export const featureFlags = {
  // Phase 1 features
  userRegistration: true,
  userLogin: true,
  userProfiles: true,
  passwordReset: true,
  
  // Phase 2 features
  sellerApplication: true,
  sellerDashboard: true,
  listingManagement: true,
  dashboardAnalytics: true,
  
  // Phase 3 features
  hostelFiltering: true,
  discoveryFeed: true,
  advancedSearch: true,
  
  // Phase 4 features
  ratingSystem: true,
  reportSystem: true,
  transactionTracking: true,
  
  // Future features (not yet implemented)
  adminPanel: false,
  pushNotifications: false,
  chatSystem: false,
  paymentIntegration: false,
  mobileApp: false
};

export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature] || false;
}; 