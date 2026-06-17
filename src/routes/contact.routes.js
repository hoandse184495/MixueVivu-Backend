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

router.post('/', protect, createContact);
router.get('/my-contacts', protect, getMyContacts);

router.get('/', protect, authorizeRoles('manager'), getAllContacts);
router.put('/:id/reply', protect, authorizeRoles('manager'), replyContact);

module.exports = router;