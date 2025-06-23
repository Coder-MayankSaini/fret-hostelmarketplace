const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel selection is required']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  itemsSold: {
    type: Number,
    default: 0
  },
  itemsRented: {
    type: Number,
    default: 0
  },
  // Seller-specific fields
  isSeller: {
    type: Boolean,
    default: false
  },
  sellerStatus: {
    type: String,
    enum: ['not_applied', 'pending', 'approved', 'rejected'],
    default: 'not_applied'
  },
  sellerProfile: {
    availabilityHours: {
      type: String,
      trim: true
    },
    profileDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Profile description cannot exceed 500 characters']
    },
    appliedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    },
    rejectedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ hostel: 1, email: 1 });
UserSchema.index({ sellerStatus: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update rating method
UserSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.totalRatings) + newRating;
  this.totalRatings += 1;
  this.rating = totalRating / this.totalRatings;
  return this.save();
};

// Apply to become seller method
UserSchema.methods.applyToBeSeller = function(availabilityHours, profileDescription) {
  this.sellerStatus = 'pending';
  this.sellerProfile = {
    availabilityHours,
    profileDescription,
    appliedAt: new Date()
  };
  return this.save();
};

// Approve seller method (for admin use)
UserSchema.methods.approveSeller = function() {
  this.isSeller = true;
  this.sellerStatus = 'approved';
  this.sellerProfile.approvedAt = new Date();
  return this.save();
};

// Reject seller method (for admin use)
UserSchema.methods.rejectSeller = function(reason) {
  this.sellerStatus = 'rejected';
  this.sellerProfile.rejectedAt = new Date();
  this.sellerProfile.rejectionReason = reason;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 