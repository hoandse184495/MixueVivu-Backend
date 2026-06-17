const friendService = require('../services/friend.service');

const searchUsers = async (req, res, next) => {
  try {
    const users = await friendService.searchUsers(
      req.query.keyword,
      req.user.id
    );

    res.status(200).json({
      message: 'Search users successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getMyFriends = async (req, res, next) => {
  try {
    const friends = await friendService.getMyFriends(req.user.id);

    res.status(200).json({
      message: 'Get my friends successfully',
      data: friends,
    });
  } catch (error) {
    next(error);
  }
};

const getFriendRequests = async (req, res, next) => {
  try {
    const requests = await friendService.getFriendRequests(req.user.id);

    res.status(200).json({
      message: 'Get friend requests successfully',
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const sendFriendRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: 'Receiver id is required',
      });
    }

    if (Number(receiverId) === Number(req.user.id)) {
      return res.status(400).json({
        message: 'You cannot add yourself',
      });
    }

    const request = await friendService.sendFriendRequest(
      req.user.id,
      receiverId
    );

    res.status(201).json({
      message: 'Send friend request successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const acceptFriendRequest = async (req, res, next) => {
  try {
    const request = await friendService.acceptFriendRequest(
      req.params.id,
      req.user.id
    );

    if (!request) {
      return res.status(404).json({
        message: 'Friend request not found',
      });
    }

    res.status(200).json({
      message: 'Accept friend request successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const rejectFriendRequest = async (req, res, next) => {
  try {
    const request = await friendService.rejectFriendRequest(
      req.params.id,
      req.user.id
    );

    if (!request) {
      return res.status(404).json({
        message: 'Friend request not found',
      });
    }

    res.status(200).json({
      message: 'Reject friend request successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const removeFriend = async (req, res, next) => {
  try {
    const request = await friendService.removeFriend(
      req.params.id,
      req.user.id
    );

    if (!request) {
      return res.status(404).json({
        message: 'Friend not found',
      });
    }

    res.status(200).json({
      message: 'Remove friend successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  getMyFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
};