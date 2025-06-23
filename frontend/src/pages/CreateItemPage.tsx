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
  ToggleLeft,
  ToggleRight,
  Eye,
  Edit3,
  Calendar
} from 'lucide-react';

const CATEGORIES = [
  { value: 'books', label: 'Books', icon: '📚' },
  { value: 'furniture', label: 'Furniture', icon: '🪑' },
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'clothing', label: 'Clothing', icon: '👕' },
  { value: 'kitchen', label: 'Kitchen Items', icon: '🍽️' },
  { value: 'sports', label: 'Sports & Fitness', icon: '⚽' },
  { value: 'study', label: 'Study Materials', icon: '📖' },
  { value: 'decor', label: 'Room Decor', icon: '🖼️' },
  { value: 'other', label: 'Other', icon: '📦' }
];

const CONDITIONS = [
  { value: 'new', label: 'New', color: 'text-green-600' },
  { value: 'used', label: 'Used', color: 'text-blue-600' },
  { value: 'refurbished', label: 'Refurbished', color: 'text-purple-600' }
];

const RENT_DURATIONS = [
  { value: 'day', label: 'Per Day' },
  { value: 'week', label: 'Per Week' },
  { value: 'month', label: 'Per Month' },
  { value: 'semester', label: 'Per Semester' }
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
    condition: 'used',
    category: '',
    listingType: 'sell',
    rentDuration: 'day',
    status: 'available'
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Character count for title
  const titleCharCount = formData.title.length;
  const maxTitleLength = 60;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Handle title character limit
    if (name === 'title' && value.length > maxTitleLength) {
      return;
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
        navigate('/dashboard');
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

  const renderMarkdownPreview = (text: string) => {
    // Simple markdown preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  if (!user?.isSeller) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Seller Access Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be a verified seller to create listings.
          </p>
          <button
            onClick={() => navigate('/become-seller')}
            className="btn-primary"
          >
            Become a Seller
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
        <p className="text-gray-600">List an item for sale or rent in your hostel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="title" className="label">
                  <FileText className="w-4 h-4 mr-2" />
                  Title *
                </label>
                <span className={`text-sm ${titleCharCount > 50 ? 'text-red-600' : 'text-gray-500'}`}>
                  {titleCharCount}/{maxTitleLength}
                </span>
              </div>
              <input
                id="title"
                name="title"
                type="text"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., iPhone 13 Pro - Excellent Condition"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={maxTitleLength}
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="description" className="label">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Description *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                  <span className="text-xs text-gray-500">Markdown supported</span>
                </div>
              </div>
              
              {showPreview ? (
                <div
                  className="min-h-32 p-3 border border-gray-300 rounded-md bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(formData.description) }}
                />
              ) : (
                <textarea
                  id="description"
                  name="description"
                  className={`input ${errors.description ? 'border-red-500' : ''}`}
                  rows={5}
                  placeholder="Describe your item in detail. Use **bold** and *italic* for emphasis."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              )}
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              <div className="mt-2 text-xs text-gray-500">
                <p>Markdown tips: **bold**, *italic*, line breaks supported</p>
              </div>
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
                    className={`input ${errors.price ? 'border-red-500' : ''}`}
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
                    className={`input ${errors.category ? 'border-red-500' : ''}`}
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

            {/* Status Toggle */}
            <div className="card p-6">
              <h3 className="label mb-4">Availability Status</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Item Status</h4>
                  <p className="text-sm text-gray-600">
                    Set your item as {formData.status === 'available' ? 'available' : 'sold/unavailable'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    status: prev.status === 'available' ? 'sold' : 'available' 
                  }))}
                  className="flex items-center"
                >
                  {formData.status === 'available' ? (
                    <ToggleRight className="w-8 h-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
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
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
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
                  <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload Image</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}
              </div>
              
              {errors.images && <p className="text-red-600 text-sm">{errors.images}</p>}
              <p className="text-xs text-gray-500">
                Upload high-quality images. First image will be the main thumbnail.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Eye className="w-4 h-4 mr-2 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Preview</h3>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Preview Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No image uploaded</p>
                    </div>
                  )}
                </div>
                
                {/* Preview Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {formData.title || 'Item Title'}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary-600">
                      ₹{formData.price || '0'}
                      {formData.listingType === 'rent' && (
                        <span className="text-sm text-gray-500">
                          /{formData.rentDuration}
                        </span>
                      )}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      formData.condition === 'new' ? 'bg-green-100 text-green-800' :
                      formData.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {CONDITIONS.find(c => c.value === formData.condition)?.label || 'Used'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {formData.description || 'Item description will appear here...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {CATEGORIES.find(c => c.value === formData.category)?.label || 'Category'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Just now
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Help Tips */}
            <div className="card p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for Success</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use clear, high-quality photos</li>
                <li>• Write detailed descriptions</li>
                <li>• Price competitively</li>
                <li>• Be responsive to inquiries</li>
                <li>• Keep item condition accurate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItemPage; 