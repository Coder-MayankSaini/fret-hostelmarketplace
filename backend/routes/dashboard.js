const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get seller dashboard analytics
// @route   GET /api/dashboard/analytics
// @access  Private (Sellers only)
router.get('/analytics', protect, async (req, res) => {
  try {
    // Check if user is a seller
    if (!req.user.isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only sellers can access dashboard analytics.'
      });
    }

    const sellerId = req.user._id;

    // Get total listings count
    const totalListings = await Item.countDocuments({ seller: sellerId });
    const activeListings = await Item.countDocuments({ 
      seller: sellerId, 
      status: 'available',
      isActive: true 
    });
    const inactiveListings = totalListings - activeListings;

    // Get sold/rented items count
    const soldItems = await Item.countDocuments({ 
      seller: sellerId, 
      status: 'sold' 
    });
    const rentedItems = await Item.countDocuments({ 
      seller: sellerId, 
      status: 'rented' 
    });

    // Get monthly transactions for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await Item.aggregate([
      {
        $match: {
          seller: sellerId,
          status: { $in: ['sold', 'rented'] },
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Item.aggregate([
      {
        $match: { seller: sellerId }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get total views on listings
    const totalViews = await Item.aggregate([
      {
        $match: { seller: sellerId }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // Get recent activity (last 10 interested users)
    const recentActivity = await Item.find(
      { 
        seller: sellerId,
        'interestedUsers.0': { $exists: true }
      },
      { 
        title: 1, 
        interestedUsers: { $slice: -5 },
        createdAt: 1
      }
    )
    .populate('interestedUsers.user', 'name roomNumber')
    .sort({ 'interestedUsers.contactedAt': -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalListings,
          activeListings,
          inactiveListings,
          soldItems,
          rentedItems,
          totalViews: totalViews[0]?.totalViews || 0,
          rating: req.user.rating || 0,
          totalRatings: req.user.totalRatings || 0
        },
        monthlyTransactions,
        categoryBreakdown,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard analytics'
    });
  }
});

// @desc    Get seller's listings for management
// @route   GET /api/dashboard/listings
// @access  Private (Sellers only)
router.get('/listings', protect, async (req, res) => {
  try {
    if (!req.user.isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only sellers can access listing management.'
      });
    }

    const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
    const sellerId = req.user._id;

    // Build filter
    const filter = { seller: sellerId };
    if (status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('hostel', 'name');

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + listings.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Dashboard listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching listings'
    });
  }
});

// @desc    Toggle listing status (active/inactive)
// @route   PATCH /api/dashboard/listings/:id/toggle
// @access  Private (Owner only)
router.patch('/listings/:id/toggle', protect, async (req, res) => {
  try {
    const listing = await Item.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own listings.'
      });
    }

    listing.isActive = !listing.isActive;
    await listing.save();

    res.json({
      success: true,
      message: `Listing ${listing.isActive ? 'activated' : 'deactivated'} successfully`,
      data: listing
    });
  } catch (error) {
    console.error('Toggle listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling listing status'
    });
  }
});

module.exports = router; 