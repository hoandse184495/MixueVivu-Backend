const adminService = require('../services/admin.service');

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
  getAllUsers, getUserById, blockUser, unblockUser,
  getDashboard, getRevenueStats, getBookingStats, getTopTours,
};
