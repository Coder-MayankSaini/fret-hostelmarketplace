const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Electronics',
      'Books',
      'Furniture',
      'Clothing',
      'Kitchen',
      'Sports',
      'Study Materials',
      'Appliances',
      'Accessories',
      'Other'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Item condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['sell', 'rent']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  rentDuration: {
    type: String,
    enum: ['hour', 'day', 'week', 'month'],
    required: function() {
      return this.listingType === 'rent';
    }
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'reserved'],
    default: 'available'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  views: {
    type: Number,
    default: 0
  },
  interestedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotedUntil: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ItemSchema.index({ hostel: 1, status: 1, isActive: 1 });
ItemSchema.index({ category: 1, listingType: 1 });
ItemSchema.index({ seller: 1, status: 1 });
ItemSchema.index({ title: 'text', description: 'text', tags: 'text' });
ItemSchema.index({ createdAt: -1 });
ItemSchema.index({ price: 1 });

// Virtual for formatted price
ItemSchema.virtual('formattedPrice').get(function() {
  if (this.listingType === 'rent') {
    return `₹${this.price}/${this.rentDuration}`;
  }
  return `₹${this.price}`;
});

// Method to increment views
ItemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to mark as sold/rented
ItemSchema.methods.markAsSoldOrRented = function() {
  this.status = this.listingType === 'sell' ? 'sold' : 'rented';
  this.isActive = false;
  return this.save();
};

// Static method to find available items in a hostel
ItemSchema.statics.findAvailableInHostel = function(hostelId, filters = {}) {
  const query = {
    hostel: hostelId,
    status: 'available',
    isActive: true,
    ...filters
  };
  
  return this.find(query)
    .populate('seller', 'name roomNumber rating avatar')
    .populate('hostel', 'name')
    .sort({ isPromoted: -1, createdAt: -1 });
};

// Static method for search
ItemSchema.statics.searchItems = function(searchTerm, hostelId, filters = {}) {
  const query = {
    $and: [
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      },
      {
        hostel: hostelId,
        status: 'available',
        isActive: true,
        ...filters
      }
    ]
  };
  
  return this.find(query)
    .populate('seller', 'name roomNumber rating avatar')
    .populate('hostel', 'name')
    .sort({ isPromoted: -1, createdAt: -1 });
};

module.exports = mongoose.model('Item', ItemSchema); 