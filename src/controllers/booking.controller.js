const bookingService = require('../services/booking.service');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user.id,
      ...req.body,
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Tour not found or tour is not approved',
      });
    }

    res.status(201).json({
      message: 'Booking tour successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user.id);

    res.status(200).json({
      message: 'Get my bookings successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();

    res.status(200).json({
      message: 'Get all bookings successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getProviderBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getProviderBookings(req.user.id);

    res.status(200).json({
      message: 'Get provider bookings successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(
      Number(req.params.id),
      req.body.status
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      message: 'Update booking status successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const cancelMyBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelMyBooking(
      req.params.id,
      req.user.id
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      message: 'Cancel booking successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const confirmBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.confirmBooking(Number(req.params.id), req.user.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found or you do not have permission',
      });
    }

    res.status(200).json({
      message: 'Confirm booking successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.rejectBooking(Number(req.params.id), req.user.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found or you do not have permission',
      });
    }

    res.status(200).json({
      message: 'Reject booking successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelMyBooking,
  confirmBooking,
  rejectBooking,
};