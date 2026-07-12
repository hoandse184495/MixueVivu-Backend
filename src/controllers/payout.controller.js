const payoutService = require('../services/payout.service');

const getEligibleBookings = async (req, res, next) => {
  try {
    const data = await payoutService.getEligibleBookings();
    res.status(200).json({ message: 'Get eligible bookings successfully', data });
  } catch (error) {
    next(error);
  }
};

const getAllPayouts = async (req, res, next) => {
  try {
    const data = await payoutService.getAllPayouts();
    res.status(200).json({ message: 'Get all payouts successfully', data });
  } catch (error) {
    next(error);
  }
};

const getMyPayouts = async (req, res, next) => {
  try {
    const data = await payoutService.getMyPayouts(req.user.id);
    res.status(200).json({ message: 'Get my payouts successfully', data });
  } catch (error) {
    next(error);
  }
};

const createPayout = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    const payout = await payoutService.createPayout({ bookingId: Number(bookingId) });
    if (!payout) return res.status(400).json({ message: 'Booking not eligible for payout' });
    res.status(201).json({ message: 'Create payout successfully', data: payout });
  } catch (error) {
    next(error);
  }
};

const confirmPayout = async (req, res, next) => {
  try {
    const payout = await payoutService.confirmPayout(Number(req.params.id));
    res.status(200).json({ message: 'Payout confirmed successfully', data: payout });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Payout not found' });
    next(error);
  }
};

module.exports = { getEligibleBookings, getAllPayouts, getMyPayouts, createPayout, confirmPayout };
