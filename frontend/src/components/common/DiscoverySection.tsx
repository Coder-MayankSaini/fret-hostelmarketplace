import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  University, 
  Package, 
  Grid,
  List,
  ChevronDown
} from 'lucide-react';
import { searchItems, getDiscoveryFilters } from '../../services/api';
import { LoadingSpinner } from './LoadingSpinner';

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  listingType: 'sell' | 'rent';
  category: string;
  condition: string;
  images: string[];
  seller: {
    name: string;
    roomNumber: string;
    rating: number;
    avatar?: string;
  };
  hostel: {
    name: string;
    university: string;
  };
  createdAt: string;
}

interface DiscoveryFilters {
  categories: string[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
  listingTypes: Array<{ _id: string; count: number }>;
  scopeCounts: {
    hostel: number;
    university: number;
  };
  userInfo: {
    hostel: string;
    university: string;
  };
}

interface SearchFilters {
  search: string;
  category: string;
  listingType: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  scope: 'hostel' | 'university';
}

const DiscoverySection: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filters, setFilters] = useState<DiscoveryFilters | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    listingType: '',
    condition: '',
    minPrice: 0,
    maxPrice: 10000,
    scope: 'hostel'
  });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchDiscoveryFilters = async () => {
    try {
      const response = await getDiscoveryFilters();
      if (response.success) {
        setFilters(response.data);
        setSearchFilters(prev => ({
          ...prev,
          maxPrice: response.data.priceRange.maxPrice
        }));
      }
    } catch (error) {
      console.error('Error fetching discovery filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    setSearching(true);
    try {
      const response = await searchItems({
        ...searchFilters,
        page: 1,
        limit: 12
      });
      if (response.success) {
        setItems(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setSearching(false);
    }
  }, [searchFilters]);

  // Fetch discovery filters on component mount
  useEffect(() => {
    fetchDiscoveryFilters();
  }, []);

  // Search items when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchFilters, handleSearch]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      search: '',
      category: '',
      listingType: '',
      condition: '',
      minPrice: 0,
      maxPrice: filters?.priceRange.maxPrice || 10000,
      scope: 'hostel'
    });
  };

  const formatPrice = (price: number, listingType: string) => {
    return listingType === 'rent' ? `₹${price}/day` : `₹${price}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Discovery Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Discover Items</h2>
            <p className="text-gray-600 mt-1">
              Find items in your {searchFilters.scope === 'hostel' ? 'hostel' : 'university'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => updateFilter('scope', 'hostel')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  searchFilters.scope === 'hostel'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Hostel ({filters?.scopeCounts.hostel})</span>
              </button>
              <button
                onClick={() => updateFilter('scope', 'university')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  searchFilters.scope === 'university'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <University className="w-4 h-4" />
                <span>University ({filters?.scopeCounts.university})</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Context */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900 font-medium">{filters?.userInfo.hostel}</span>
            </div>
            <div className="flex items-center space-x-2">
              <University className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">{filters?.userInfo.university}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for items..."
            value={searchFilters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={searchFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {filters?.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Listing Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={searchFilters.listingType}
                onChange={(e) => updateFilter('listingType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Buy & Rent</option>
                <option value="sell">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={searchFilters.condition}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ₹{searchFilters.minPrice} - ₹{searchFilters.maxPrice}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={filters?.priceRange.maxPrice || 10000}
                  value={searchFilters.minPrice}
                  onChange={(e) => updateFilter('minPrice', parseInt(e.target.value))}
                  className="w-full"
                />
                <input
                  type="range"
                  min={searchFilters.minPrice}
                  max={filters?.priceRange.maxPrice || 10000}
                  value={searchFilters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border">
        {searching ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search in a different scope
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Found {pagination.total} items in your {searchFilters.scope}
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                  <Link
                    key={item._id}
                    to={`/item/${item._id}`}
                    className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                      {item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.listingType === 'sell' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.listingType === 'sell' ? 'For Sale' : 'For Rent'}
                        </span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price, item.listingType)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {item.hostel.name}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{item.seller.name} • Room {item.seller.roomNumber}</span>
                        <span>⭐ {item.seller.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <Link
                    key={item._id}
                    to={`/item/${item._id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price, item.listingType)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 font-medium rounded-full ${
                            item.listingType === 'sell' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.listingType === 'sell' ? 'For Sale' : 'For Rent'}
                          </span>
                          <span>{item.category}</span>
                          <span>{item.seller.name} • Room {item.seller.roomNumber}</span>
                          <span>⭐ {item.seller.rating.toFixed(1)}</span>
                          <span>{item.hostel.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverySection; 