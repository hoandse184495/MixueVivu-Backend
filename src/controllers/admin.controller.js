const adminService = require('../services/admin.service');

const allowedRoles = ['user', 'provider', 'manager'];
const allowedProviderStatuses = ['pending', 'approved', 'rejected'];

const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizePhone = (phone) =>
  typeof phone === 'string' ? phone.trim().replace(/\s+/g, '') : '';

const isValidPhone = (phone) =>
  /^(0|\+84)[0-9]{9,10}$/.test(normalizePhone(phone));

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
      phone,
      role = 'user',
      providerStatus,
    } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password || !phone?.trim()) {
      return res.status(400).json({ message: 'Họ tên, email, mật khẩu và số điện thoại là bắt buộc' });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Họ tên phải có ít nhất 2 ký tự' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email không đúng định dạng' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số' });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số',
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
      phone: normalizePhone(phone),
      role,
    });

    res.status(201).json({ message: 'Create user successfully', data: user });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email này đã được sử dụng. Vui lòng nhập email khác.' });
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role, providerStatus } = req.body;

    if (fullName !== undefined && fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Họ tên phải có ít nhất 2 ký tự' });
    }

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Email không đúng định dạng' });
    }

    if (phone !== undefined && !phone.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại' });
    }

    if (phone !== undefined && !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số' });
    }

    if (password && !isStrongEnoughPassword(password)) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số',
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
      fullName: fullName?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone === undefined ? undefined : normalizePhone(phone),
    });

    res.status(200).json({ message: 'Update user successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email này đã được sử dụng. Vui lòng nhập email khác.' });
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
