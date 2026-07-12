const express = require('express');
const {
  getEligibleBookings, getAllPayouts, getMyPayouts, createPayout, confirmPayout,
} = require('../controllers/payout.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payout
 *   description: API Quản lý đối soát
 */

/**
 * @swagger
 * /payouts/my-payouts:
 *   get:
 *     summary: Xem tiền hoa hồng nhận được (Provider)
 *     tags: [Payout]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/my-payouts', protect, authorizeRoles('provider'), getMyPayouts);

/**
 * @swagger
 * /payouts/eligible:
 *   get:
 *     summary: Xem các Tour đã hoàn thành chờ đối soát (Admin)
 *     tags: [Payout]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/eligible', protect, authorizeRoles('manager'), getEligibleBookings);

/**
 * @swagger
 * /payouts:
 *   get:
 *     summary: Danh sách tất cả Payouts (Admin)
 *     tags: [Payout]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, authorizeRoles('manager'), getAllPayouts);

/**
 * @swagger
 * /payouts:
 *   post:
 *     summary: Tạo Payout mới (Admin)
 *     tags: [Payout]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, authorizeRoles('manager'), createPayout);

/**
 * @swagger
 * /payouts/{id}/confirm:
 *   put:
 *     summary: Xác nhận đã chuyển tiền cho Provider (Admin)
 *     tags: [Payout]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/confirm', protect, authorizeRoles('manager'), confirmPayout);

module.exports = router;
