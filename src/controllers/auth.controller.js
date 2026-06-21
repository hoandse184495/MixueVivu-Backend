const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongEnoughPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const issueTokens = async (user) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshDays = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 30;
  const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

  await authService.createRefreshToken({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  const accessToken = generateAccessToken(user);
  return {
    token: accessToken,
    accessToken,
    refreshToken,
  };
};

const register = async (req, res, next) => {
  try {
    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain a letter and a number',
      });
    }

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authService.createUser({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });
    const tokens = await issueTokens(user);

    return res.status(201).json({
      message: 'Register successfully',
      data: { ...tokens, user },
    });
  } catch (error) {
    if (error.number === 2601 || error.number === 2627) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await authService.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokens = await issueTokens(user);
    delete user.password;

    return res.status(200).json({
      message: 'Login successfully',
      data: { ...tokens, user },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== 'string' || !refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const user = await authService.consumeRefreshToken(hashRefreshToken(refreshToken));
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const tokens = await issueTokens(user);
    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== 'string' || !refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    await authService.revokeRefreshToken(hashRefreshToken(refreshToken));
    return res.status(200).json({ message: 'Logout successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user.id);
    return res.status(200).json({
      message: 'Get profile successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getProfile };
