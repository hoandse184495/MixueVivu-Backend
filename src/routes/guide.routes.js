const express = require('express');

const {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
} = require('../controllers/guide.controller');

const {
  protect,
  authorizeRoles,
} = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllGuides);
router.get('/:id', getGuideById);

router.post('/', protect, authorizeRoles('manager'), createGuide);
router.put('/:id', protect, authorizeRoles('manager'), updateGuide);
router.delete('/:id', protect, authorizeRoles('manager'), deleteGuide);

module.exports = router;