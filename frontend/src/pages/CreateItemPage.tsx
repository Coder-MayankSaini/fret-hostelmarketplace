import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createItem } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Upload,
  X,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  FileText,
  Edit3
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Books', label: 'Books', icon: '📚' },
  { value: 'Furniture', label: 'Furniture', icon: '🪑' },
  { value: 'Electronics', label: 'Electronics', icon: '📱' },
  { value: 'Clothing', label: 'Clothing', icon: '👕' },
  { value: 'Kitchen', label: 'Kitchen Items', icon: '🍽️' },
  { value: 'Sports', label: 'Sports & Fitness', icon: '⚽' },
  { value: 'Study Materials', label: 'Study Materials', icon: '📖' },
  { value: 'Appliances', label: 'Appliances', icon: '🔌' },
  { value: 'Accessories', label: 'Accessories', icon: '💍' },
  { value: 'Other', label: 'Other', icon: '📦' }
];

const CONDITIONS = [
  { value: 'New', label: 'New' },
  { value: 'Like New', label: 'Like New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' }
];

const RENT_DURATIONS = [
  { value: 'hour', label: 'Per Hour' },
  { value: 'day', label: 'Per Day' },
  { value: 'week', label: 'Per Week' },
  { value: 'month', label: 'Per Month' }
];

const CreateItemPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'Good',
    category: '',
    listingType: 'sell',
    rentDuration: 'day',
    status: 'available'
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        images,
        hostel: user?.hostel._id
      };
      
      const response = await createItem(submitData);
      
      if (response.success) {
        toast.success('Item created successfully!');
        navigate('/');
      } else {
        toast.error(response.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('An error occurred while creating the listing');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can create listings - simplified logic
  const canCreateListing = user?.isSeller || user?.sellerStatus === 'approved';

  if (!canCreateListing) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Package className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark-900 mb-4">
            Seller Access Required
          </h1>
          <p className="text-dark-600 mb-6">
            You need to be a verified seller to create listings. Apply to become a seller to start listing your items.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/become-seller')}
              className="btn-primary w-full"
            >
              Apply to Become a Seller
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline w-full"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">Create New Listing</h1>
        <p className="text-dark-600">List an item for sale or rent in your hostel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card p-6">
          <label htmlFor="title" className="label">
            <FileText className="w-4 h-4 mr-2" />
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g., iPhone 13 Pro - Excellent Condition"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={100}
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="card p-6">
          <label htmlFor="description" className="label">
            <Edit3 className="w-4 h-4 mr-2" />
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            className={`input ${errors.description ? 'input-error' : ''}`}
            rows={5}
            placeholder="Describe your item in detail..."
            value={formData.description}
            onChange={handleInputChange}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Price and Listing Type */}
        <div className="card p-6">
          <h3 className="label mb-4">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing *
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Listing Type</label>
              <select
                name="listingType"
                className="input"
                value={formData.listingType}
                onChange={handleInputChange}
              >
                <option value="sell">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            
            <div>
              <label className="label">
                {formData.listingType === 'sell' ? 'Price (₹)' : 'Rental Rate (₹)'}
              </label>
              <input
                name="price"
                type="number"
                className={`input ${errors.price ? 'input-error' : ''}`}
                placeholder="0"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>
          </div>
          
          {formData.listingType === 'rent' && (
            <div>
              <label className="label">Rental Duration</label>
              <select
                name="rentDuration"
                className="input"
                value={formData.rentDuration}
                onChange={handleInputChange}
              >
                {RENT_DURATIONS.map(duration => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category and Condition */}
        <div className="card p-6">
          <h3 className="label mb-4">
            <Tag className="w-4 h-4 mr-2" />
            Item Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                name="category"
                className={`input ${errors.category ? 'input-error' : ''}`}
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
            </div>
            
            <div>
              <label className="label">Condition</label>
              <select
                name="condition"
                className="input"
                value={formData.condition}
                onChange={handleInputChange}
              >
                {CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="card p-6">
          <h3 className="label mb-4">
            <ImageIcon className="w-4 h-4 mr-2" />
            Images * (Max 5)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-primary-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-primary-300 rounded-lg flex flex-col items-center justify-center text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Add Photo</span>
              </button>
            )}
          </div>
          
          {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <p className="text-xs text-dark-500 mt-2">
            Upload up to 5 images. Max size: 5MB per image. Accepted formats: JPG, PNG, GIF
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-outline flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Creating...</span>
              </div>
            ) : (
              'Create Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateItemPage; 