const express = require('express');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: API Quản lý danh mục
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Lấy danh mục theo ID
 *     tags: [Category]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Tạo danh mục mới (Admin)
 *     tags: [Category]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, authorizeRoles('manager'), createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục (Admin)
 *     tags: [Category]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', protect, authorizeRoles('manager'), updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Xóa danh mục (Admin)
 *     tags: [Category]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', protect, authorizeRoles('manager'), deleteCategory);

module.exports = router;
