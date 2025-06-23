const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Item = require('../models/Item');
const { protect, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Contact seller (reveal phone number)
// @route   POST /api/items/:id/contact
// @access  Private
router.post('/:id/contact', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name roomNumber phoneNumber rating avatar')
      .populate('hostel', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item belongs to user's hostel
    if (item.hostel._id.toString() !== req.user.hostel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Item not available in your hostel.'
      });
    }

    // Don't allow contacting yourself
    if (item.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot contact yourself'
      });
    }

    // Add to interested users if not already there
    const existingInterest = item.interestedUsers.find(
      interest => interest.user.toString() === req.user._id.toString()
    );

    if (!existingInterest) {
      item.interestedUsers.push({
        user: req.user._id,
        contactedAt: new Date()
      });
      await item.save();
    }

    res.json({
      success: true,
      message: 'Contact information revealed',
      data: {
        seller: {
          name: item.seller.name,
          roomNumber: item.seller.roomNumber,
          phoneNumber: item.seller.phoneNumber,
          rating: item.seller.rating,
          avatar: item.seller.avatar
        },
        hostel: item.hostel.name
      }
    });
  } catch (error) {
    console.error('Contact seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error revealing contact information'
    });
  }
});

// @desc    Report user
// @route   POST /api/items/:id/report
// @access  Private
router.post('/:id/report', protect, [
  body('reason').notEmpty().withMessage('Report reason is required'),
  body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const item = await Item.findById(req.params.id)
      .populate('seller', 'name roomNumber')
      .populate('hostel', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Don't allow reporting yourself
    if (item.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself'
      });
    }

    const { reason, description } = req.body;

    // Create report record (you might want a separate Report model in production)
    const reportData = {
      reportedBy: req.user._id,
      reportedUser: item.seller._id,
      itemId: item._id,
      reason,
      description: description || '',
      reportedAt: new Date(),
      hostel: req.user.hostel._id
    };

    // For now, we'll just log this - in production, save to a Report collection
    console.log('User Report:', reportData);

    res.json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.'
    });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting report'
    });
  }
});

// @desc    Rate seller after purchase
// @route   POST /api/items/:id/rate
// @access  Private
router.post('/:id/rate', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 300 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const item = await Item.findById(req.params.id)
      .populate('seller');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is sold/rented
    if (item.status === 'available') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed transactions'
      });
    }

    // Don't allow rating yourself
    if (item.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate yourself'
      });
    }

    // Check if user has contacted this seller
    const hasContacted = item.interestedUsers.some(
      interest => interest.user.toString() === req.user._id.toString()
    );

    if (!hasContacted) {
      return res.status(400).json({
        success: false,
        message: 'You can only rate sellers you have interacted with'
      });
    }

    const { rating, review } = req.body;

    // Update seller's rating
    const User = require('../models/User');
    const seller = await User.findById(item.seller._id);
    await seller.updateRating(rating);

    // In production, you might want to store individual ratings/reviews
    console.log('Rating submitted:', {
      itemId: item._id,
      sellerId: seller._id,
      buyerId: req.user._id,
      rating,
      review: review || '',
      ratedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        newRating: seller.rating,
        totalRatings: seller.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting rating'
    });
  }
});

// @desc    Mark item as sold/rented (seller only)
// @route   PATCH /api/items/:id/mark-sold
// @access  Private
router.patch('/:id/mark-sold', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user is the seller
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can mark items as sold'
      });
    }

    // Check if item is available
    if (item.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Item is already marked as sold or rented'
      });
    }

    // Mark as sold or rented based on listing type
    await item.markAsSoldOrRented();

    // Update seller's statistics
    const User = require('../models/User');
    const seller = await User.findById(req.user._id);
    if (item.listingType === 'sell') {
      seller.itemsSold += 1;
    } else {
      seller.itemsRented += 1;
    }
    await seller.save();

    res.json({
      success: true,
      message: `Item marked as ${item.status} successfully`,
      data: item
    });
  } catch (error) {
    console.error('Mark item sold error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking item as sold'
    });
  }
});

// @desc    Get discovery filters and stats
// @route   GET /api/items/discovery/filters
// @access  Private
router.get('/discovery/filters', protect, async (req, res) => {
  try {
    await req.user.populate('hostel');
    const userUniversity = req.user.hostel.university;
    const userHostelId = req.user.hostel._id;

    // Get all hostels in the same university
    const Hostel = require('../models/Hostel');
    const universityHostels = await Hostel.find({ 
      university: userUniversity, 
      isActive: true 
    }).select('_id name');
    const hostelIds = universityHostels.map(h => h._id);

    // Get available categories from items in university
    const categories = await Item.distinct('category', {
      hostel: { $in: hostelIds },
      status: 'available',
      isActive: true
    });

    // Get price ranges
    const priceStats = await Item.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          status: 'available',
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    // Get counts by listing type
    const listingTypeCounts = await Item.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          status: 'available',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$listingType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get counts by hostel vs university scope
    const hostelCount = await Item.countDocuments({
      hostel: userHostelId,
      status: 'available',
      isActive: true
    });

    const universityCount = await Item.countDocuments({
      hostel: { $in: hostelIds },
      status: 'available',
      isActive: true
    });

    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        priceRange: priceStats[0] || { minPrice: 0, maxPrice: 10000, avgPrice: 0 },
        listingTypes: listingTypeCounts,
        scopeCounts: {
          hostel: hostelCount,
          university: universityCount
        },
        userInfo: {
          hostel: req.user.hostel.name,
          university: userUniversity,
          availableHostels: universityHostels
        }
      }
    });
  } catch (error) {
    console.error('Get discovery filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching discovery filters'
    });
  }
});

// @desc    Get all items based on discovery logic
// @route   GET /api/items
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      category,
      listingType,
      condition,
      minPrice,
      maxPrice,
      search,
      scope = 'hostel', // 'hostel' or 'university'
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filters = {};
    if (category) filters.category = category;
    if (listingType) filters.listingType = listingType;
    if (condition) filters.condition = condition;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Discovery logic: Get user's hostel and university info
    await req.user.populate('hostel');
    const userHostelId = req.user.hostel._id;
    const userUniversity = req.user.hostel.university;

    let discoveryQuery;
    
    if (scope === 'university') {
      // Find all hostels in the same university
      const Hostel = require('../models/Hostel');
      const universityHostels = await Hostel.find({ 
        university: userUniversity, 
        isActive: true 
      }).select('_id');
      const hostelIds = universityHostels.map(h => h._id);
      
      discoveryQuery = {
        hostel: { $in: hostelIds },
        status: 'available',
        isActive: true,
        ...filters
      };
    } else {
      // Default to hostel-only scope
      discoveryQuery = {
        hostel: userHostelId,
        status: 'available',
        isActive: true,
        ...filters
      };
    }

    let items;
    let total;

    if (search) {
      // Use text search with discovery scope
      const searchQuery = {
        $and: [
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { tags: { $in: [new RegExp(search, 'i')] } }
            ]
          },
          discoveryQuery
        ]
      };
      
      items = await Item.find(searchQuery)
        .populate('seller', 'name roomNumber rating avatar')
        .populate('hostel', 'name university')
        .sort({ isPromoted: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
      
      total = await Item.countDocuments(searchQuery);
    } else {
      items = await Item.find(discoveryQuery)
        .populate('seller', 'name roomNumber rating avatar')
        .populate('hostel', 'name university')
        .sort({ isPromoted: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
      
      total = await Item.countDocuments(discoveryQuery);
    }

    res.json({
      success: true,
      data: items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      },
      discoveryInfo: {
        userHostel: req.user.hostel.name,
        userUniversity: userUniversity,
        scope: scope
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching items'
    });
  }
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name roomNumber rating avatar phoneNumber')
      .populate('hostel', 'name address');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item belongs to user's hostel
    if (item.hostel._id.toString() !== req.user.hostel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Item not available in your hostel.'
      });
    }

    // Increment views if not the owner
    if (item.seller._id.toString() !== req.user._id.toString()) {
      await item.incrementViews();
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching item'
    });
  }
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      listingType,
      price,
      rentDuration,
      images,
      tags,
      specifications
    } = req.body;

    const item = new Item({
      title,
      description,
      category,
      condition,
      listingType,
      price,
      rentDuration: listingType === 'rent' ? rentDuration : undefined,
      images,
      tags: tags || [],
      specifications: specifications || {},
      seller: req.user._id,
      hostel: req.user.hostel._id
    });

    await item.save();

    const populatedItem = await Item.findById(item._id)
      .populate('seller', 'name roomNumber rating avatar')
      .populate('hostel', 'name');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: populatedItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating item'
    });
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Owner only)
router.put('/:id', protect, requireOwnership(Item), [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('condition').optional().isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  body('status').optional().isIn(['available', 'sold', 'rented', 'reserved'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updateFields = {};
    const allowedFields = ['title', 'description', 'price', 'condition', 'status', 'images', 'tags', 'specifications'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('seller', 'name roomNumber rating avatar')
     .populate('hostel', 'name');

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating item'
    });
  }
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Owner only)
router.delete('/:id', protect, requireOwnership(Item), async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);

    // Update hostel active items count
    await req.user.hostel.updateOne({ $inc: { totalActiveItems: -1 } });

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting item'
    });
  }
});

// @desc    Mark item as sold/rented
// @route   PATCH /api/items/:id/sold
// @access  Private (Owner only)
router.patch('/:id/sold', protect, requireOwnership(Item), async (req, res) => {
  try {
    const item = req.resource;
    await item.markAsSoldOrRented();

    // Update user stats
    if (item.listingType === 'sell') {
      await req.user.updateOne({ $inc: { itemsSold: 1 } });
    } else {
      await req.user.updateOne({ $inc: { itemsRented: 1 } });
    }

    res.json({
      success: true,
      message: `Item marked as ${item.status} successfully`,
      data: item
    });
  } catch (error) {
    console.error('Mark sold error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking item as sold'
    });
  }
});

// @desc    Express interest in item
// @route   POST /api/items/:id/interest
// @access  Private
router.post('/:id/interest', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item belongs to user's hostel
    if (item.hostel.toString() !== req.user.hostel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Item not available in your hostel.'
      });
    }

    // Check if user is the seller
    if (item.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot express interest in your own item'
      });
    }

    // Check if already interested
    const alreadyInterested = item.interestedUsers.find(
      interest => interest.user.toString() === req.user._id.toString()
    );

    if (alreadyInterested) {
      return res.status(400).json({
        success: false,
        message: 'You have already expressed interest in this item'
      });
    }

    item.interestedUsers.push({ user: req.user._id });
    await item.save();

    res.json({
      success: true,
      message: 'Interest expressed successfully'
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error expressing interest'
    });
  }
});

// @desc    Get user's own items
// @route   GET /api/items/my/listings
// @access  Private
router.get('/my/listings', protect, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 12 } = req.query;
    
    const filter = { seller: req.user._id };
    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await Item.find(filter)
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
    console.error('Get my items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your items'
    });
  }
});

module.exports = router; 