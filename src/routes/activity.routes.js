const express = require('express');

const {
  getActivitiesByTourId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activity.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: API Hoạt động
 */

/**
 * @swagger
 * /activities/tour/{tourId}:
 *   get:
 *     summary: Lấy hoạt động theo Tour
 *     tags: [Activity]
 *     parameters: [{ in: path, name: tourId, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/tour/:tourId', getActivitiesByTourId);

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Lấy chi tiết hoạt động
 *     tags: [Activity]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', getActivityById);

/**
 * @swagger
 * /activities:
 *   post:
 *     summary: Thêm hoạt động (Admin)
 *     tags: [Activity]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, authorizeRoles('manager'), createActivity);

/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     summary: Cập nhật hoạt động (Admin)
 *     tags: [Activity]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', protect, authorizeRoles('manager'), updateActivity);

/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: Xóa hoạt động (Admin)
 *     tags: [Activity]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', protect, authorizeRoles('manager'), deleteActivity);

module.exports = router;