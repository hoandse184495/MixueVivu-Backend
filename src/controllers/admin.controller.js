const adminService = require('../services/admin.service');

const allowedRoles = ['user', 'provider', 'manager'];
const allowedProviderStatuses = ['pending', 'approved', 'rejected'];

const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongEnoughPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({ message: 'Get users successfully', data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Get user successfully', data: user });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await adminService.blockUser(Number(req.params.id));
    res.status(200).json({ message: 'Block user successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await adminService.unblockUser(Number(req.params.id));
    res.status(200).json({ message: 'Unblock user successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      role = 'user',
      providerStatus,
    } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain a letter and a number',
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    if (providerStatus && !allowedProviderStatuses.includes(providerStatus)) {
      return res.status(400).json({ message: 'Invalid provider status' });
    }

    const user = await adminService.createUser({
      ...req.body,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
    });

    res.status(201).json({ message: 'Create user successfully', data: user });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { email, password, role, providerStatus } = req.body;

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password && !isStrongEnoughPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain a letter and a number',
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    if (providerStatus && !allowedProviderStatuses.includes(providerStatus)) {
      return res.status(400).json({ message: 'Invalid provider status' });
    }

    const user = await adminService.updateUser(Number(req.params.id), {
      ...req.body,
      fullName: req.body.fullName?.trim(),
      email: email?.trim().toLowerCase(),
    });

    res.status(200).json({ message: 'Update user successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await adminService.deleteUser(Number(req.params.id));
    res.status(200).json({ message: 'Delete user successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'User has related records. Block the account instead of deleting it.',
      });
    }
    next(error);
  }
};

const approveProvider = async (req, res, next) => {
  try {
    const user = await adminService.approveProvider(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider approved successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    next(error);
  }
};

const rejectProvider = async (req, res, next) => {
  try {
    const user = await adminService.rejectProvider(Number(req.params.id), req.body.reason);
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider rejected successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    res.status(200).json({ message: 'Get dashboard successfully', data });
  } catch (error) {
    next(error);
  }
};

const getRevenueStats = async (req, res, next) => {
  try {
    const data = await adminService.getRevenueStats();
    res.status(200).json({ message: 'Get revenue stats successfully', data });
  } catch (error) {
    next(error);
  }
};

const getBookingStats = async (req, res, next) => {
  try {
    const data = await adminService.getBookingStats();
    res.status(200).json({ message: 'Get booking stats successfully', data });
  } catch (error) {
    next(error);
  }
};

const getTopTours = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const data = await adminService.getTopTours(limit);
    res.status(200).json({ message: 'Get top tours successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, blockUser, unblockUser,
  approveProvider, rejectProvider,
  getDashboard, getRevenueStats, getBookingStats, getTopTours,
};
