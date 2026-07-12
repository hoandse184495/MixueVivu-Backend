const express = require('express');

const {
  createContact,
  getMyContacts,
  getAllContacts,
  replyContact,
} = require('../controllers/contact.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: API Liên hệ
 */

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Gửi liên hệ
 *     tags: [Contact]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, createContact);

/**
 * @swagger
 * /contacts/my-contacts:
 *   get:
 *     summary: Xem liên hệ của tôi
 *     tags: [Contact]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/my-contacts', protect, getMyContacts);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Xem tất cả liên hệ (Admin)
 *     tags: [Contact]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, authorizeRoles('manager'), getAllContacts);

/**
 * @swagger
 * /contacts/{id}/reply:
 *   put:
 *     summary: Trả lời liên hệ (Admin)
 *     tags: [Contact]
 *     security: [{ BearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/reply', protect, authorizeRoles('manager'), replyContact);

module.exports = router;