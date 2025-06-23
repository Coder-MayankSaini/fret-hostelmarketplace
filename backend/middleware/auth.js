const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Get user from token
      const user = await User.findById(decoded.id).populate('hostel');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user belongs to the same hostel
const requireSameHostel = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    
    if (req.user.hostel._id.toString() !== hostelId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access items from your hostel.'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in hostel validation'
    });
  }
};

// Middleware to check if user owns the resource
const requireOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const resource = await Model.findById(id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      if (resource.seller && resource.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own items.'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error in ownership validation'
      });
    }
  };
};

// Utility function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = {
  protect,
  requireSameHostel,
  requireOwnership,
  generateToken
}; 