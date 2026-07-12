const express = require('express');

const {
  searchUsers,
  getMyFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} = require('../controllers/friend.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Friend
 *   description: API Bạn bè
 */

/**
 * @swagger
 * /friends/search:
 *   get:
 *     summary: Tìm kiếm người dùng
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/search', protect, searchUsers);

/**
 * @swagger
 * /friends:
 *   get:
 *     summary: Xem danh sách bạn bè
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, getMyFriends);

/**
 * @swagger
 * /friends/requests:
 *   get:
 *     summary: Xem lời mời kết bạn
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/requests', protect, getFriendRequests);

/**
 * @swagger
 * /friends/request:
 *   post:
 *     summary: Gửi lời mời kết bạn
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/request', protect, sendFriendRequest);

/**
 * @swagger
 * /friends/{id}/accept:
 *   put:
 *     summary: Chấp nhận lời mời
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/accept', protect, acceptFriendRequest);

/**
 * @swagger
 * /friends/{id}/reject:
 *   put:
 *     summary: Từ chối lời mời
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/reject', protect, rejectFriendRequest);

/**
 * @swagger
 * /friends/{id}:
 *   delete:
 *     summary: Hủy kết bạn
 *     tags: [Friend]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', protect, removeFriend);

module.exports = router;