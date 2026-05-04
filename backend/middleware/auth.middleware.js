const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      req.user = null;
      return next();
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated' });
    }

    req.user = user;
    console.log('Authenticated user:', { id: user._id, role: user.role });
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};



const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      console.log(`Access denied for role: ${req.user.role}. Required roles: ${roles}`);
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

const authorizeDoctorOrAdmin = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Allow if role is doctor OR admin
    if (req.user.role === 'doctor' || req.user.role === 'admin') {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied. Doctor or Admin role required.' });
  };
};

module.exports = { authenticate, authorize, authorizeDoctorOrAdmin };