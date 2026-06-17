const express = require('express');

const {
  searchUsers,
  getMyFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} = require('../controllers/friend.controller');

const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/', protect, getMyFriends);
router.get('/requests', protect, getFriendRequests);

router.post('/request', protect, sendFriendRequest);
router.put('/:id/accept', protect, acceptFriendRequest);
router.put('/:id/reject', protect, rejectFriendRequest);
router.delete('/:id', protect, removeFriend);

module.exports = router;