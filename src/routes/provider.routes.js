const express = require('express');
const { getProviderStats, getProviderRevenueByMonth } = require('../controllers/provider.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Provider
 *   description: API dành riêng cho Provider
 */

router.use(protect, authorizeRoles('provider'));

/**
 * @swagger
 * /provider/stats:
 *   get:
 *     summary: Thống kê tổng quan (Provider)
 *     tags: [Provider]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats', getProviderStats);

/**
 * @swagger
 * /provider/stats/revenue:
 *   get:
 *     summary: Doanh thu hàng tháng (Provider)
 *     tags: [Provider]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats/revenue', getProviderRevenueByMonth);

module.exports = router;
