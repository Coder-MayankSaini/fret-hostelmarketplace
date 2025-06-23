import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSellerStatus } from '../services/seller';
import { Plus, Store, Users, Package, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import DiscoverySection from '../components/common/DiscoverySection';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [sellerStatus, setSellerStatus] = useState<'not_applied' | 'pending' | 'approved' | 'rejected'>('not_applied');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerStatus();
  }, []);

  const fetchSellerStatus = async () => {
    try {
      const response = await getSellerStatus();
      if (response.success) {
        setSellerStatus(response.data.sellerStatus);
      }
    } catch (error) {
      console.error('Error fetching seller status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSellerStatusBadge = () => {
    switch (sellerStatus) {
      case 'pending':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Seller Application Pending
          </div>
        );
      case 'approved':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified Seller
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Seller Application Rejected
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Fretio
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your hostel marketplace for buying and renting items directly from your neighbors
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Users className="w-4 h-4 mr-1" />
            {user?.hostel.name}
          </div>
          {!loading && getSellerStatusBadge()}
        </div>
      </div>

      {/* Become a Seller CTA */}
      {!loading && sellerStatus === 'not_applied' && (
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Start Selling?
              </h3>
              <p className="text-gray-600 mb-4">
                Join our community of sellers and start earning from items you no longer need. 
                It's quick, easy, and helps your hostel neighbors find what they're looking for!
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Sell or rent items directly to hostel neighbors</li>
                <li>• Set your own availability hours</li>
                <li>• Build trust through ratings and reviews</li>
                <li>• No delivery hassle - buyers collect from your room</li>
              </ul>
            </div>
            <div className="hidden md:block">
              <Store className="w-24 h-24 text-primary-400" />
            </div>
          </div>
          <Link
            to="/become-seller"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Become a Seller
          </Link>
        </div>
      )}

      {/* Seller Application Status */}
      {!loading && sellerStatus === 'pending' && (
        <div className="card p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                Seller Application Under Review
              </h3>
              <p className="text-yellow-700">
                Your application is being processed. You'll be notified once approved and can start listing items.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seller Approved */}
      {!loading && (sellerStatus === 'approved' || user?.isSeller) && (
        <div className="card p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  You're a Verified Seller!
                </h3>
                <p className="text-green-700">
                  Start listing items for sale or rent in your hostel community.
                </p>
              </div>
            </div>
            <Link
              to="/create-item"
              className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Link>
          </div>
        </div>
      )}

      {/* Seller Application Rejected */}
      {!loading && sellerStatus === 'rejected' && (
        <div className="card p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  Seller Application Not Approved
                </h3>
                <p className="text-red-700">
                  Your application was not approved. You can review and apply again.
                </p>
              </div>
            </div>
            <Link
              to="/become-seller"
              className="btn-outline border-red-300 text-red-700 hover:bg-red-50"
            >
              Apply Again
            </Link>
          </div>
        </div>
      )}

      {/* Discovery Section */}
      <DiscoverySection />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <Package className="w-8 h-8 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900 mb-2">Browse Items</h3>
          <p className="text-gray-600 text-sm">
            Discover items available for sale or rent in your hostel
          </p>
        </Link>

        {(user?.isSeller || sellerStatus === 'approved') && (
          <Link
            to="/create-item"
            className="card p-6 hover:shadow-lg transition-shadow group"
          >
            <Plus className="w-8 h-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">List an Item</h3>
            <p className="text-gray-600 text-sm">
              Create a new listing to sell or rent your items
            </p>
          </Link>
        )}

        <Link
          to="/my-items"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <Package className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900 mb-2">My Listings</h3>
          <p className="text-gray-600 text-sm">
            Manage your active listings and view transaction history
          </p>
        </Link>
      </div>

      {/* Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Hostel Community
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{user?.hostel.totalUsers || 0}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{user?.hostel.totalActiveItems || 0}</div>
            <div className="text-sm text-gray-600">Active Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{user?.itemsSold || 0}</div>
            <div className="text-sm text-gray-600">Items Sold</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{user?.itemsRented || 0}</div>
            <div className="text-sm text-gray-600">Items Rented</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 