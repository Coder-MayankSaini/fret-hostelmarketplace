const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const { protect, generateToken } = require('../middleware/auth');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('hostel').isMongoId().withMessage('Please select a valid hostel'),
  body('roomNumber').trim().isLength({ min: 1 }).withMessage('Room number is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phoneNumber, hostel, roomNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if hostel exists
    const hostelExists = await Hostel.findById(hostel);
    if (!hostelExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hostel selected'
      });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      phoneNumber,
      hostel,
      roomNumber
    });

    await user.save();

    // Update hostel user count
    await Hostel.findByIdAndUpdate(hostel, { $inc: { totalUsers: 1 } });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = await User.findById(user._id).populate('hostel', 'name address');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password').populate('hostel', 'name address');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('hostel', 'name address');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user data'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('roomNumber').optional().trim().isLength({ min: 1 }).withMessage('Room number is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, phoneNumber, roomNumber, avatar } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (roomNumber) updateFields.roomNumber = roomNumber;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('hostel', 'name address');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

// @desc    Apply to become seller
// @route   POST /api/auth/seller/apply
// @access  Private
router.post('/seller/apply', protect, [
  body('availabilityHours').trim().isLength({ min: 1 }).withMessage('Availability hours is required'),
  body('profileDescription').optional().trim().isLength({ max: 500 }).withMessage('Profile description cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { availabilityHours, profileDescription } = req.body;

    // Check if user has already applied or is already a seller
    if (req.user.sellerStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to become a seller. Please wait for approval.'
      });
    }

    if (req.user.isSeller) {
      return res.status(400).json({
        success: false,
        message: 'You are already a seller.'
      });
    }

    // Apply to become seller
    await req.user.applyToBeSeller(availabilityHours, profileDescription || '');

    res.json({
      success: true,
      message: 'Seller application submitted successfully. You will be notified once approved.'
    });
  } catch (error) {
    console.error('Seller application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting seller application'
    });
  }
});

// @desc    Mock approve seller (for MVP - auto approval)
// @route   POST /api/auth/seller/mock-approve
// @access  Private
router.post('/seller/mock-approve', protect, async (req, res) => {
  try {
    // Check if user has pending application
    if (req.user.sellerStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending seller application found.'
      });
    }

    // Auto-approve for MVP
    await req.user.approveSeller();

    // Get updated user data
    const updatedUser = await User.findById(req.user._id).populate('hostel', 'name address');

    res.json({
      success: true,
      message: 'Congratulations! Your seller application has been approved.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Seller approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving seller application'
    });
  }
});

// @desc    Get seller status
// @route   GET /api/auth/seller/status
// @access  Private
router.get('/seller/status', protect, async (req, res) => {
  try {
    const { sellerStatus, isSeller, sellerProfile } = req.user;

    res.json({
      success: true,
      data: {
        sellerStatus,
        isSeller,
        sellerProfile: sellerProfile || {}
      }
    });
  } catch (error) {
    console.error('Get seller status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting seller status'
    });
  }
});

module.exports = router; 