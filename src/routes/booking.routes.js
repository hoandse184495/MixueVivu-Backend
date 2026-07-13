const express = require('express');

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelMyBooking,
  confirmBooking,
  rejectBooking,
  completeBooking,
} = require('../controllers/booking.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Khách hàng đặt tour
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, authorizeRoles('user'), createBooking);
/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Danh sách đặt tour của tôi (Customer)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/my-bookings', protect, authorizeRoles('user'), getMyBookings);

/**
 * @swagger
 * /bookings/provider:
 *   get:
 *     summary: Danh sách đặt tour của provider (Provider)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '/provider',
  protect,
  authorizeRoles('provider'),
  getProviderBookings
);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Hủy tour (Customer)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/cancel', protect, authorizeRoles('user'), cancelMyBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Lấy tất cả đặt chỗ (Admin)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, authorizeRoles('manager'), getAllBookings);

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái (Admin)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/status', protect, authorizeRoles('manager'), updateBookingStatus);

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   put:
 *     summary: Xác nhận đặt chỗ (Provider)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/confirm', protect, authorizeRoles('provider'), confirmBooking);

/**
 * @swagger
 * /bookings/{id}/reject:
 *   put:
 *     summary: Từ chối đặt chỗ (Provider)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/reject', protect, authorizeRoles('provider'), rejectBooking);

/**
 * @swagger
 * /bookings/{id}/complete:
 *   put:
 *     summary: Hoàn thành đặt chỗ (Provider)
 *     tags: [Booking]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/complete', protect, authorizeRoles('provider'), completeBooking);

module.exports = router;