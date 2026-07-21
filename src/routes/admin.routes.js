const express = require('express');
const {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, blockUser, unblockUser,
  approveProvider, rejectProvider,
  getDashboard, getRevenueStats, getBookingStats, getTopTours,
} = require('../controllers/admin.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// All admin routes require manager role
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API Quản trị viên
 */

router.use(protect, authorizeRoles('manager'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/users', getAllUsers);
router.post('/users', createUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Xem chi tiết người dùng
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /admin/users/{id}/block:
 *   put:
 *     summary: Khóa tài khoản
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/users/:id/block', blockUser);

/**
 * @swagger
 * /admin/users/{id}/unblock:
 *   put:
 *     summary: Mở khóa tài khoản
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/users/:id/unblock', unblockUser);

router.put('/providers/:id/approve', approveProvider);
router.put('/providers/:id/reject', rejectProvider);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Thống kê tổng quan
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /admin/stats/revenue:
 *   get:
 *     summary: Thống kê doanh thu (theo tháng)
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats/revenue', getRevenueStats);

/**
 * @swagger
 * /admin/stats/bookings:
 *   get:
 *     summary: Thống kê đặt chỗ
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats/bookings', getBookingStats);

/**
 * @swagger
 * /admin/stats/top-tours:
 *   get:
 *     summary: Thống kê tour phổ biến nhất
 *     tags: [Admin]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats/top-tours', getTopTours);

module.exports = router;
