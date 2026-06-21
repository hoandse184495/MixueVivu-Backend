const express = require('express');

const {
  register,
  login,
  refresh,
  logout,
  getProfile,
} = require('../controllers/auth.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);

module.exports = router;
