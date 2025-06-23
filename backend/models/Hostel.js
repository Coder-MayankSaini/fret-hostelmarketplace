const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hostel name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Hostel name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    }
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms count is required'],
    min: [1, 'Hostel must have at least 1 room']
  },
  facilities: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  totalActiveItems: {
    type: Number,
    default: 0
  },
  university: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
HostelSchema.index({ name: 1, isActive: 1 });
HostelSchema.index({ 'address.city': 1, 'address.state': 1 });

// Method to get full address
HostelSchema.methods.getFullAddress = function() {
  const { street, city, state, zipCode, country } = this.address;
  return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
};

// Static method to find active hostels
HostelSchema.statics.findActiveHostels = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Hostel', HostelSchema); 