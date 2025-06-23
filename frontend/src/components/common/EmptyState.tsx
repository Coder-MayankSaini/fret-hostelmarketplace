import React from 'react';
import { Package, ShoppingBag, Search, Users, Calendar, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'listings' | 'transactions' | 'search' | 'sellers' | 'activities' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'listings':
        return Package;
      case 'transactions':
        return ShoppingBag;
      case 'search':
        return Search;
      case 'sellers':
        return Users;
      case 'activities':
        return Calendar;
      case 'error':
        return AlertCircle;
      default:
        return Package;
    }
  };

  const getIllustration = () => {
    const IconComponent = getIcon();
    const baseClasses = "mx-auto mb-6 text-secondary-300";
    
    switch (type) {
      case 'listings':
        return (
          <div className="relative">
            <div className="w-32 h-32 bg-university-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <IconComponent className={`${baseClasses} w-16 h-16 text-university-300`} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-university-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-university-400 rounded-full animate-pulse-soft"></div>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="relative">
            <div className="w-32 h-32 bg-green-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <IconComponent className={`${baseClasses} w-16 h-16 text-green-300`} />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="relative">
            <div className="w-32 h-32 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <IconComponent className={`${baseClasses} w-16 h-16 text-amber-300`} />
            </div>
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-100 rounded-full animate-pulse-soft"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-100 rounded-full animate-pulse-soft"></div>
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <div className="w-32 h-32 bg-red-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <IconComponent className={`${baseClasses} w-16 h-16 text-red-300`} />
            </div>
          </div>
        );
      default:
        return (
          <div className="w-32 h-32 bg-secondary-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <IconComponent className={`${baseClasses} w-16 h-16`} />
          </div>
        );
    }
  };

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        {getIllustration()}
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          {title}
        </h3>
        <p className="text-secondary-500 mb-6">
          {description}
        </p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-university-600 text-white text-sm font-medium rounded-lg hover:bg-university-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-university-500 focus:ring-offset-2"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState; 