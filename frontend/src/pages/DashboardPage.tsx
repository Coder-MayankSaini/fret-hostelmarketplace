import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardAnalytics, getDashboardListings, toggleListingStatus } from '../services/dashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DashboardAnalytics, Item } from '../types';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  Eye,
  Package,
  Star,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import EmptyState from '../components/common/EmptyState';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [listings, setListings] = useState<Item[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await getDashboardAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      toast.error('Error loading analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      setListingsLoading(true);
      const response = await getDashboardListings({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      });
      
      if (response.success) {
        setListings(response.data);
        setTotalPages(response.pagination.pages);
      } else {
        toast.error('Failed to load listings');
      }
    } catch (error) {
      toast.error('Error loading listings');
    } finally {
      setListingsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    if (user && !user.isSeller) {
      navigate('/become-seller');
      return;
    }
    
    if (user?.isSeller) {
      fetchAnalytics();
    }
  }, [user, navigate, fetchAnalytics]);

  useEffect(() => {
    if (user?.isSeller) {
      fetchListings();
    }
  }, [searchTerm, statusFilter, currentPage, user?.isSeller, fetchListings]);

  const handleToggleStatus = async (listingId: string) => {
    try {
      const response = await toggleListingStatus(listingId);
      if (response.success) {
        toast.success(response.message || 'Status updated successfully');
        fetchListings();
      } else {
        toast.error(response.message || 'Failed to update listing');
      }
    } catch (error) {
      toast.error('Error updating listing status');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-secondary-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">Inactive</span>;
    }
    
    switch (status) {
      case 'available':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>;
      case 'sold':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Sold</span>;
      case 'rented':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Rented</span>;
      case 'reserved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Reserved</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">{status}</span>;
    }
  };

  // Chart colors using university theme
  const chartColors = {
    primary: 'var(--university-500, #3b82f6)',
    secondary: 'var(--university-300, #93c5fd)', 
    accent: 'var(--accent-500, #ef4444)',
    success: '#10b981',
    warning: '#f59e0b'
  };

  const pieColors = [chartColors.primary, chartColors.secondary, chartColors.success, chartColors.warning, chartColors.accent];

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user?.isSeller) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <Package className="w-16 h-16 text-university-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Seller Dashboard Access Required
            </h1>
            <p className="text-secondary-600 mb-6">
              You need to be a verified seller to access the dashboard.
            </p>
            <Link to="/become-seller" className="inline-flex items-center px-6 py-3 bg-university-600 text-white font-medium rounded-lg hover:bg-university-700 transition-colors duration-200">
              Become a Seller
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-600 mt-1">Manage your listings and track performance</p>
          </div>
          <Link 
            to="/create-item" 
            className="inline-flex items-center px-4 py-2 bg-university-600 text-white font-medium rounded-lg hover:bg-university-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-university-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Listing
          </Link>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Total Listings</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">{analytics.overview.totalListings}</p>
                    <p className="text-xs text-secondary-500 mt-1">
                      {analytics.overview.activeListings} active • {analytics.overview.inactiveListings} inactive
                    </p>
                  </div>
                  <div className="p-3 bg-university-50 rounded-lg">
                    <Package className="w-6 h-6 text-university-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Transactions</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">
                      {analytics.overview.soldItems + analytics.overview.rentedItems}
                    </p>
                    <p className="text-xs text-secondary-500 mt-1">
                      {analytics.overview.soldItems} sold • {analytics.overview.rentedItems} rented
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Total Views</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">{analytics.overview.totalViews}</p>
                    <p className="text-xs text-secondary-500 mt-1">Across all listings</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Rating</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(analytics.overview.rating)}
                      <span className="text-sm text-secondary-600 ml-2">
                        ({analytics.overview.rating.toFixed(1)})
                      </span>
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      {analytics.overview.totalRatings} reviews
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Transactions Chart */}
              {analytics.monthlyTransactions.length > 0 ? (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Monthly Transactions</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.monthlyTransactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke={chartColors.primary}
                        fill={chartColors.secondary}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Monthly Transactions</h3>
                  <EmptyState
                    type="transactions"
                    title="No Transactions Yet"
                    description="Your transaction history will appear here once you start selling items."
                    className="py-8"
                  />
                </div>
              )}

              {/* Category Distribution */}
              {analytics.categoryDistribution.length > 0 ? (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Category Distribution</h3>
                  <EmptyState
                    type="listings"
                    title="No Categories Yet"
                    description="Your category distribution will appear here once you start listing items."
                    className="py-8"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Listings Management */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="px-6 py-4 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 sm:mb-0">My Listings</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-university-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-university-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {listingsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : listings.length === 0 ? (
              <EmptyState
                type="listings"
                title="No Listings Found"
                description={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filter criteria." : "Create your first listing to get started selling items."}
                actionLabel={(!searchTerm && statusFilter === 'all') ? "Create First Listing" : undefined}
                onAction={(!searchTerm && statusFilter === 'all') ? () => navigate('/create-item') : undefined}
                className="py-12"
              />
            ) : (
              <div className="space-y-4">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 text-xs font-medium text-secondary-500 uppercase tracking-wider pb-2 border-b border-secondary-200">
                  <div className="col-span-2">Item</div>
                  <div>Category</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>

                {/* Listings */}
                {listings.map((item) => (
                  <div key={item._id} className="grid grid-cols-1 md:grid-cols-6 gap-4 py-4 border-b border-secondary-100 last:border-b-0">
                    {/* Item Info */}
                    <div className="md:col-span-2 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-secondary-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-secondary-900 truncate">{item.title}</p>
                        <p className="text-xs text-secondary-500 truncate">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Eye className="w-3 h-3 text-secondary-400" />
                          <span className="text-xs text-secondary-500">{item.views || 0} views</span>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center md:justify-start">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-university-100 text-university-800">
                        {item.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center md:justify-start">
                      <span className="text-sm font-medium text-secondary-900">
                        ₹{item.price}{item.listingType === 'rent' && '/month'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center md:justify-start">
                      {getStatusBadge(item.status, item.isActive)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 md:justify-start">
                      <button
                        onClick={() => handleToggleStatus(item._id)}
                        className="p-1 text-secondary-400 hover:text-university-600 transition-colors duration-200"
                        title={item.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {item.isActive ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <Link
                        to={`/edit-item/${item._id}`}
                        className="p-1 text-secondary-400 hover:text-university-600 transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-1 text-secondary-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-secondary-200">
                <div className="text-sm text-secondary-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-secondary-300 rounded hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-secondary-300 rounded hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 