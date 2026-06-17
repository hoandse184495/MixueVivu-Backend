const express = require('express');

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelMyBooking,
  getProviderBookings,
} = require('../controllers/booking.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/*
  User đặt tour
*/
router.post('/', protect, authorizeRoles('user'), createBooking);

/*
  User xem booking của mình
*/
router.get('/my-bookings', protect, authorizeRoles('user'), getMyBookings);

/*
  Provider xem booking của các tour do mình đăng
  Route /provider phải để trước /:id nếu sau này có route /:id
*/
router.get(
  '/provider',
  protect,
  authorizeRoles('provider'),
  getProviderBookings
);

/*
  User hủy booking của mình
*/
router.put('/:id/cancel', protect, authorizeRoles('user'), cancelMyBooking);

/*
  Manager xem toàn bộ booking
*/
router.get('/', protect, authorizeRoles('manager'), getAllBookings);

/*
  Manager cập nhật trạng thái booking
*/
router.put('/:id/status', protect, authorizeRoles('manager'), updateBookingStatus);

module.exports = router;