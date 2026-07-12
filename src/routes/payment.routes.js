const express = require('express');
const {
  getAllPayments, getMyPayments, confirmPayment, refundPayment,
} = require('../controllers/payment.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: API Quản lý thanh toán
 */

/**
 * @swagger
 * /payments/my-payments:
 *   get:
 *     summary: Xem thanh toán của tôi (Customer)
 *     tags: [Payment]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/my-payments', protect, getMyPayments);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Lấy tất cả khoản thanh toán của khách (Admin)
 *     tags: [Payment]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, authorizeRoles('manager'), getAllPayments);

/**
 * @swagger
 * /payments/{id}/confirm:
 *   put:
 *     summary: Xác nhận đã nhận tiền (Admin)
 *     tags: [Payment]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/confirm', protect, authorizeRoles('manager'), confirmPayment);

/**
 * @swagger
 * /payments/{id}/refund:
 *   put:
 *     summary: Hoàn tiền (Admin)
 *     tags: [Payment]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/refund', protect, authorizeRoles('manager'), refundPayment);

module.exports = router;
