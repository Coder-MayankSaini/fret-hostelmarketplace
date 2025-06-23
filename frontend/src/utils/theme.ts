export interface UniversityTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
}

export const universityThemes: Record<string, UniversityTheme> = {
  'mumbai-university': {
    name: 'Mumbai University',
    colors: {
      primary: '#1e40af', // Blue
      secondary: '#475569', // Slate
      accent: '#dc2626', // Red
      'primary-50': '#eff6ff',
      'primary-100': '#dbeafe',
      'primary-500': '#3b82f6',
      'primary-600': '#2563eb',
      'primary-700': '#1d4ed8',
      'secondary-50': '#f8fafc',
      'secondary-100': '#f1f5f9',
      'secondary-500': '#64748b',
      'accent-500': '#ef4444',
      'accent-600': '#dc2626',
    }
  },
  'delhi-university': {
    name: 'Delhi University',
    colors: {
      primary: '#7c3aed', // Purple
      secondary: '#374151', // Gray
      accent: '#f59e0b', // Amber
      'primary-50': '#f5f3ff',
      'primary-100': '#ede9fe',
      'primary-500': '#8b5cf6',
      'primary-600': '#7c3aed',
      'primary-700': '#6d28d9',
      'secondary-50': '#f9fafb',
      'secondary-100': '#f3f4f6',
      'secondary-500': '#6b7280',
      'accent-500': '#f59e0b',
      'accent-600': '#d97706',
    }
  },
  'bangalore-tech': {
    name: 'Bangalore Institute of Technology',
    colors: {
      primary: '#059669', // Emerald
      secondary: '#4b5563', // Gray
      accent: '#dc2626', // Red
      'primary-50': '#ecfdf5',
      'primary-100': '#d1fae5',
      'primary-500': '#10b981',
      'primary-600': '#059669',
      'primary-700': '#047857',
      'secondary-50': '#f9fafb',
      'secondary-100': '#f3f4f6',
      'secondary-500': '#6b7280',
      'accent-500': '#ef4444',
      'accent-600': '#dc2626',
    }
  },
  'default': {
    name: 'Default Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#ef4444',
      'primary-50': '#eff6ff',
      'primary-100': '#dbeafe',
      'primary-500': '#3b82f6',
      'primary-600': '#2563eb',
      'primary-700': '#1d4ed8',
      'secondary-50': '#f8fafc',
      'secondary-100': '#f1f5f9',
      'secondary-500': '#64748b',
      'accent-500': '#ef4444',
      'accent-600': '#dc2626',
    }
  }
};

export const applyUniversityTheme = (themeKey: string) => {
  const theme = universityThemes[themeKey] || universityThemes.default;
  const root = document.documentElement;

  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (key.includes('-')) {
      root.style.setProperty(`--${key}`, value);
    } else {
      root.style.setProperty(`--${key}-500`, value);
    }
  });

  // Store theme preference
  localStorage.setItem('university-theme', themeKey);
};

export const getCurrentTheme = (): string => {
  return localStorage.getItem('university-theme') || 'default';
};

export const detectUniversityTheme = (universityName: string): string => {
  const university = universityName.toLowerCase();
  
  if (university.includes('mumbai')) return 'mumbai-university';
  if (university.includes('delhi')) return 'delhi-university';
  if (university.includes('bangalore') || university.includes('tech')) return 'bangalore-tech';
  
  return 'default';
}; 