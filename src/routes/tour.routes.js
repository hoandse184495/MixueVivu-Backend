const express = require('express');

const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  addReview,
  getMyTours,
  getPendingTours,
  approveTour,
  rejectTour,
  resubmitTour,
  hideTour,
  completeTour,
} = require('../controllers/tour.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Lấy tất cả Tours
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', getAllTours);

/**
 * @swagger
 * /tours/my-tours:
 *   get:
 *     summary: Lấy danh sách tour của tôi (Provider)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/my-tours', protect, authorizeRoles('provider'), getMyTours);

/**
 * @swagger
 * /tours/pending:
 *   get:
 *     summary: Lấy danh sách tour chờ duyệt (Admin)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/pending', protect, authorizeRoles('manager'), getPendingTours);

/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Lấy chi tiết Tour
 *     tags: [Tour]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', getTourById);

/**
 * @swagger
 * /tours:
 *   post:
 *     summary: Tạo Tour mới (Provider)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, authorizeRoles('provider'), createTour);

/**
 * @swagger
 * /tours/{id}:
 *   put:
 *     summary: Cập nhật Tour (Provider/Manager)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', protect, authorizeRoles('provider', 'manager'), updateTour);

/**
 * @swagger
 * /tours/{id}:
 *   delete:
 *     summary: Xóa Tour (Provider/Manager)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', protect, authorizeRoles('provider', 'manager'), deleteTour);

/**
 * @swagger
 * /tours/{id}/approve:
 *   put:
 *     summary: Duyệt Tour (Admin)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/approve', protect, authorizeRoles('manager'), approveTour);

/**
 * @swagger
 * /tours/{id}/reject:
 *   put:
 *     summary: Từ chối Tour (Admin)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/reject', protect, authorizeRoles('manager'), rejectTour);

router.put('/:id/resubmit', protect, authorizeRoles('provider'), resubmitTour);

/**
 * @swagger
 * /tours/{id}/reviews:
 *   post:
 *     summary: Thêm Đánh giá
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:id/reviews', protect, authorizeRoles('user'), addReview);

/**
 * @swagger
 * /tours/{id}/hide:
 *   put:
 *     summary: Ẩn Tour (Admin)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/hide', protect, authorizeRoles('manager'), hideTour);

/**
 * @swagger
 * /tours/{id}/complete:
 *   put:
 *     summary: Hoàn thành Tour (Provider)
 *     tags: [Tour]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/complete', protect, authorizeRoles('provider'), completeTour);

module.exports = router;
