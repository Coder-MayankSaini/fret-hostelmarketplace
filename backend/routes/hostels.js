const express = require('express');
const Hostel = require('../models/Hostel');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all active hostels
// @route   GET /api/hostels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hostels = await Hostel.findActiveHostels();
    
    res.json({
      success: true,
      data: hostels
    });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hostels'
    });
  }
});

// @desc    Get single hostel
// @route   GET /api/hostels/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    res.json({
      success: true,
      data: hostel
    });
  } catch (error) {
    console.error('Get hostel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hostel'
    });
  }
});

// @desc    Get current user's hostel info
// @route   GET /api/hostels/my/info
// @access  Private
router.get('/my/info', protect, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.user.hostel._id);
    
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    res.json({
      success: true,
      data: hostel
    });
  } catch (error) {
    console.error('Get my hostel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hostel information'
    });
  }
});

module.exports = router; 