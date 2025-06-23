import React, { useState, useRef, useEffect } from 'react';
import { Package } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate a simple placeholder if none provided
  const defaultPlaceholder = `data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-family="system-ui" font-size="14"%3ELoading...%3C/text%3E%3C/svg%3E`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  };

  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }

    return (
      <div className={`bg-secondary-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <Package className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
          <p className="text-xs text-secondary-500">Image unavailable</p>
        </div>
      </div>
    );
  };

  const renderPlaceholder = () => (
    <div className={`bg-secondary-100 rounded-lg animate-pulse ${className}`}>
      <img
        src={placeholder || defaultPlaceholder}
        alt="Loading..."
        className={`w-full h-full object-cover rounded-lg opacity-50 ${className}`}
      />
    </div>
  );

  if (isError) {
    return <>{renderFallback()}</>;
  }

  if (!isInView) {
    return (
      <div ref={imgRef} className={className}>
        {renderPlaceholder()}
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && renderPlaceholder()}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{
          position: isLoaded ? 'static' : 'absolute',
          top: isLoaded ? 'auto' : 0,
          left: isLoaded ? 'auto' : 0,
          width: isLoaded ? 'auto' : '100%',
          height: isLoaded ? 'auto' : '100%'
        }}
      />
    </div>
  );
};

export default LazyImage; 