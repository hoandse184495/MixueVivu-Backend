const express = require('express');

const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favorite.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getMyFavorites);
router.post('/', protect, addFavorite);
router.get('/check/:tourId', protect, checkFavorite);
router.delete('/:tourId', protect, removeFavorite);

module.exports = router;