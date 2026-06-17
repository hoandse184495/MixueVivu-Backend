const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await authService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized, token failed',
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};