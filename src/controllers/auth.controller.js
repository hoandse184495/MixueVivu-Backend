const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required',
      });
    }

    const existingUser = await authService.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authService.createUser({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Register successfully',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    delete user.password;

    res.status(200).json({
      message: 'Login successfully',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user.id);

    res.status(200).json({
      message: 'Get profile successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};