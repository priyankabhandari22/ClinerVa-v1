import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes and verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token Payload and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

/**
 * Middleware to restrict route to specific roles
 * Usage: router.get('/doctor-only', protect, authorizeRoles('doctor'), controllerLogic);
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'none'}) is not authorized to access this route.`
      });
    }
    next();
  };
};
