const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('hostel', 'name address')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to the same hostel
    if (user.hostel._id.toString() !== req.user.hostel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view profiles from your hostel.'
      });
    }

    // Get user's active items count
    const activeItemsCount = await Item.countDocuments({
      seller: user._id,
      status: 'available',
      isActive: true
    });

    const userWithStats = {
      ...user.toObject(),
      activeItemsCount
    };

    res.json({
      success: true,
      data: userWithStats
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @desc    Get user's items
// @route   GET /api/users/:id/items
// @access  Private
router.get('/:id/items', protect, async (req, res) => {
  try {
    const { page = 1, limit = 12, status = 'available' } = req.query;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to the same hostel
    if (user.hostel.toString() !== req.user.hostel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view items from your hostel.'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = {
      seller: req.params.id,
      isActive: true
    };
    
    if (status !== 'all') {
      filter.status = status;
    }

    const items = await Item.find(filter)
      .populate('seller', 'name roomNumber rating avatar')
      .populate('hostel', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user items'
    });
  }
});

module.exports = router; 