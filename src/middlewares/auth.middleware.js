const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      const match = req.headers.authorization.match(/^Bearer\s+(\S+)$/);
      token = match && match[1];
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

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been blocked. Please contact support.',
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

    if (
      req.user.role === 'provider' &&
      roles.includes('provider') &&
      req.user.providerStatus !== 'approved'
    ) {
      return res.status(403).json({
        message:
          req.user.providerStatus === 'rejected'
            ? `Provider account rejected: ${req.user.providerRejectReason || 'No reason provided'}`
            : 'Provider account is waiting for manager approval',
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};
