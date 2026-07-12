const express = require('express');

const {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  registerProvider,
} = require('../controllers/auth.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực người dùng
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký khách hàng mới
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/register-provider:
 *   post:
 *     summary: Đăng ký công ty du lịch mới (Provider)
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register-provider', registerProvider);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Làm mới Token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/change-password', protect, changePassword);

module.exports = router;

