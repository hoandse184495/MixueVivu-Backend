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

router.get('/tour/:tourId', getActivitiesByTourId);
router.get('/:id', getActivityById);

router.post('/', protect, authorizeRoles('manager'), createActivity);
router.put('/:id', protect, authorizeRoles('manager'), updateActivity);
router.delete('/:id', protect, authorizeRoles('manager'), deleteActivity);

module.exports = router;