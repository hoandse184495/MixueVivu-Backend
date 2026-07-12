const express = require('express');

const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favorite.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: API Tour yêu thích
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Xem tour yêu thích
 *     tags: [Favorite]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, getMyFavorites);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Thêm tour vào yêu thích
 *     tags: [Favorite]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, addFavorite);

/**
 * @swagger
 * /favorites/check/{tourId}:
 *   get:
 *     summary: Kiểm tra tour yêu thích
 *     tags: [Favorite]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: tourId, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/check/:tourId', protect, checkFavorite);

/**
 * @swagger
 * /favorites/{tourId}:
 *   delete:
 *     summary: Xóa tour khỏi yêu thích
 *     tags: [Favorite]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: tourId, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:tourId', protect, removeFavorite);

module.exports = router;