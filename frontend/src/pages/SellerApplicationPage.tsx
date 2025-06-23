import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { applyToBeSeller, getSellerStatus, mockApproveSeller } from '../services/seller';
import toast from 'react-hot-toast';
import { Clock, User, CheckCircle, AlertCircle, XCircle, Upload } from 'lucide-react';

const SellerApplicationPage: React.FC = () => {
  const [availabilityHours, setAvailabilityHours] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<'not_applied' | 'pending' | 'approved' | 'rejected'>('not_applied');
  const [statusLoading, setStatusLoading] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<any>({});
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSellerStatus();
  }, []);

  const fetchSellerStatus = async () => {
    try {
      const response = await getSellerStatus();
      if (response.success) {
        setSellerStatus(response.data.sellerStatus);
        setSellerProfile(response.data.sellerProfile);
        if (response.data.sellerProfile.availabilityHours) {
          setAvailabilityHours(response.data.sellerProfile.availabilityHours);
        }
        if (response.data.sellerProfile.profileDescription) {
          setProfileDescription(response.data.sellerProfile.profileDescription);
        }
      }
    } catch (error) {
      console.error('Error fetching seller status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!availabilityHours.trim()) {
      toast.error('Please specify your availability hours');
      return;
    }

    setIsLoading(true);
    try {
      const response = await applyToBeSeller({
        availabilityHours: availabilityHours.trim(),
        profileDescription: profileDescription.trim()
      });
      
      if (response.success) {
        toast.success(response.message || 'Application submitted successfully!');
        setSellerStatus('pending');
        
        // For MVP - auto approve after 2 seconds
        setTimeout(() => {
          handleMockApproval();
        }, 2000);
      } else {
        toast.error(response.message || 'Application failed');
      }
    } catch (error) {
      toast.error('An error occurred while submitting application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockApproval = async () => {
    try {
      const response = await mockApproveSeller();
      if (response.success) {
        toast.success(response.message || 'Application approved!');
        setSellerStatus('approved');
        if (response.data && 'user' in response.data) {
          updateUser(response.data.user);
        }
        // Redirect to profile or dashboard after approval
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error in mock approval:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For MVP, we'll just use a placeholder URL
      // In production, you would upload to Cloudinary or similar service
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show status if already applied
  if (sellerStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Under Review
          </h1>
          <p className="text-gray-600 mb-6">
            Your seller application is being reviewed. You'll be notified once it's approved.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Applied on:</strong> {sellerProfile.appliedAt ? new Date(sellerProfile.appliedAt).toLocaleDateString() : 'N/A'}
            </p>
            {sellerProfile.availabilityHours && (
              <p className="text-sm text-yellow-800 mt-1">
                <strong>Availability:</strong> {sellerProfile.availabilityHours}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (sellerStatus === 'approved' || user?.isSeller) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're a Verified Seller!
          </h1>
          <p className="text-gray-600 mb-6">
            Congratulations! You can now start listing items for sale or rent.
          </p>
          <button
            onClick={() => navigate('/create-item')}
            className="btn-primary"
          >
            Create Your First Listing
          </button>
        </div>
      </div>
    );
  }

  if (sellerStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Not Approved
          </h1>
          <p className="text-gray-600 mb-6">
            Unfortunately, your seller application was not approved at this time.
          </p>
          {sellerProfile.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Reason:</strong> {sellerProfile.rejectionReason}
              </p>
            </div>
          )}
          <button
            onClick={() => setSellerStatus('not_applied')}
            className="btn-outline"
          >
            Apply Again
          </button>
        </div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become a Seller
          </h1>
          <p className="text-gray-600">
            Join our marketplace and start selling items to your hostel community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Upload */}
          <div>
            <label className="label">Profile Photo (Optional)</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label className="btn-outline cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Help buyers recognize you with a profile photo
            </p>
          </div>

          {/* Room Number (Display only) */}
          <div>
            <label className="label">Room Number</label>
            <div className="input bg-gray-50 text-gray-600">
              {user?.roomNumber}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Buyers will use this to collect items from you
            </p>
          </div>

          {/* Availability Hours */}
          <div>
            <label htmlFor="availabilityHours" className="label">
              Availability Hours *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="availabilityHours"
                type="text"
                className="input pl-10"
                placeholder="e.g., Mon-Fri 6PM-9PM, Weekends 10AM-8PM"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              When are you typically available for item pickup?
            </p>
          </div>

          {/* Profile Description */}
          <div>
            <label htmlFor="profileDescription" className="label">
              Profile Description (Optional)
            </label>
            <textarea
              id="profileDescription"
              rows={4}
              className="input"
              placeholder="Tell buyers about yourself, what types of items you typically sell, or any other relevant information..."
              value={profileDescription}
              onChange={(e) => setProfileDescription(e.target.value)}
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {profileDescription.length}/500 characters
            </p>
          </div>

          {/* Terms and Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Seller Guidelines:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be available during your specified hours for item pickup</li>
              <li>• Provide accurate descriptions and photos of your items</li>
              <li>• Respond promptly to buyer inquiries</li>
              <li>• Maintain a clean and organized room for pickups</li>
              <li>• Be honest about item conditions and pricing</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !availabilityHours.trim()}
            className="btn-primary w-full justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting Application...
              </>
            ) : (
              'Submit Seller Application'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerApplicationPage; 