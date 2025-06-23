import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Star, 
  Flag, 
  MessageCircle, 
  Heart,
  Share2,
  Package,
  CheckCircle,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getItemById, 
  contactSeller, 
  reportUser, 
  rateSeller, 
  markItemSold 
} from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface ItemData {
  _id: string;
  title: string;
  description: string;
  price: number;
  listingType: 'sell' | 'rent';
  rentDuration?: string;
  category: string;
  condition: string;
  images: string[];
  seller: {
    _id: string;
    name: string;
    roomNumber: string;
    rating: number;
    totalRatings: number;
    avatar?: string;
    phoneNumber?: string;
  };
  hostel: {
    _id: string;
    name: string;
    university: string;
  };
  status: string;
  tags: string[];
  views: number;
  createdAt: string;
  isActive: boolean;
}

interface ContactInfo {
  seller: {
    name: string;
    roomNumber: string;
    phoneNumber: string;
    rating: number;
    avatar?: string;
  };
  hostel: string;
}

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<ItemData | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Report form state
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  // Rating form state
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const fetchItemDetails = useCallback(async () => {
    try {
      const response = await getItemById(id!);
      if (response.success) {
        setItem(response.data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id, fetchItemDetails]);

  const handleContactSeller = async () => {
    if (!item || contactInfo) return;
    
    setContactLoading(true);
    try {
      const response = await contactSeller(item._id);
      if (response.success) {
        setContactInfo(response.data);
      } else {
        alert(response.message || 'Failed to get contact information');
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
      alert('Failed to get contact information');
    } finally {
      setContactLoading(false);
    }
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      alert('Please select a reason for reporting');
      return;
    }

    try {
      const response = await reportUser(item!._id, reportReason, reportDescription);
      if (response.success) {
        alert('Report submitted successfully. Thank you for helping keep our community safe.');
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      } else {
        alert(response.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to submit report');
    }
  };

  const handleRateSeller = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await rateSeller(item!._id, rating, review);
      if (response.success) {
        alert('Rating submitted successfully. Thank you for your feedback!');
        setShowRatingModal(false);
        setRating(0);
        setReview('');
        // Update seller rating in item
        if (item) {
          setItem({
            ...item,
            seller: {
              ...item.seller,
              rating: response.data.newRating,
              totalRatings: response.data.totalRatings
            }
          });
        }
      } else {
        alert(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating seller:', error);
      alert('Failed to submit rating');
    }
  };

  const handleMarkSold = async () => {
    if (!window.confirm('Are you sure you want to mark this item as sold/rented?')) {
      return;
    }

    try {
      const response = await markItemSold(item!._id);
      if (response.success) {
        alert('Item marked as sold successfully!');
        setItem({ ...item!, status: response.data.status, isActive: false });
      } else {
        alert(response.message || 'Failed to mark item as sold');
      }
    } catch (error) {
      console.error('Error marking item sold:', error);
      alert('Failed to mark item as sold');
    }
  };

  const formatPrice = (price: number, listingType: string, rentDuration?: string) => {
    if (listingType === 'rent' && rentDuration) {
      return `₹${price}/${rentDuration}`;
    }
    return `₹${price}`;
  };

  const renderStars = (rating: number, totalRatings: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-600">({totalRatings})</span>
      </div>
    );
  };

  const renderInteractiveStars = (currentRating: number, onRatingChange: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            i <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => onRatingChange(i)}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Item not found</h2>
        <p className="text-gray-600">The item you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const isOwner = user?._id === item.seller._id;
  const canRate = item.status !== 'available' && !isOwner && contactInfo;
  const canContact = item.status === 'available' && !isOwner;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
            {item.images[currentImageIndex] && (
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            )}
          </div>
          {item.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              item.status === 'available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {item.status === 'available' ? 'Available' : 
               item.status === 'sold' ? 'Sold' : 'Rented'}
            </span>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(item.price, item.listingType, item.rentDuration)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.listingType === 'sell' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                For {item.listingType === 'sell' ? 'Sale' : 'Rent'}
              </span>
            </div>
          </div>

          {/* Item Info */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
            <div>
              <span className="text-sm text-gray-500">Category</span>
              <p className="font-medium">{item.category}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Condition</span>
              <p className="font-medium">{item.condition}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Views</span>
              <p className="font-medium">{item.views}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Posted</span>
              <p className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {item.seller.avatar ? (
                  <img src={item.seller.avatar} alt={item.seller.name} className="w-full h-full rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.seller.name}</h4>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Room {item.seller.roomNumber}</span>
                  </div>
                  {renderStars(item.seller.rating, item.seller.totalRatings)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.hostel.name} • {item.hostel.university}</p>
                
                {/* Contact Information (revealed after contact) */}
                {contactInfo && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">{contactInfo.seller.phoneNumber}</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Contact the seller to arrange pickup from their room
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOwner && item.status === 'available' && (
              <button
                onClick={handleMarkSold}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Mark as {item.listingType === 'sell' ? 'Sold' : 'Rented'}</span>
              </button>
            )}

            {canContact && (
              <button
                onClick={handleContactSeller}
                disabled={contactLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center space-x-2"
              >
                {contactLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Getting Contact Info...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    <span>Contact Seller</span>
                  </>
                )}
              </button>
            )}

            {canRate && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 flex items-center justify-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Rate Seller</span>
              </button>
            )}

            {!isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                <Flag className="w-5 h-5" />
                <span>Report User</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description and Details */}
      <div className="mt-8 bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
        </div>

        {item.tags.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report User</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam or fake listing</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="scam">Potential scam</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide any additional details about the issue..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportUser}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rate Seller</h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How was your experience with {item.seller.name}?
                </label>
                <div className="flex justify-center">
                  {renderInteractiveStars(rating, setRating)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with other buyers..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRateSeller}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsPage;