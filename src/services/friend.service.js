const { prisma } = require('../config/db');

const searchUsers = async (keyword, currentUserId) => {
  const normalizedKeyword = typeof keyword === 'string' ? keyword.trim() : '';
  if (!normalizedKeyword) {
    return [];
  }

  const users = await prisma.users.findMany({
    where: {
      id: { not: currentUserId },
      role: 'user',
      OR: [
        { fullName: { contains: normalizedKeyword } },
        { email: { contains: normalizedKeyword } },
        { phone: { contains: normalizedKeyword } },
      ],
    },
    include: {
      Friends_Friends_receiverIdToUsers: {
        where: { senderId: currentUserId, status: { in: ['pending', 'accepted'] } },
      },
      Friends_Friends_senderIdToUsers: {
        where: { receiverId: currentUserId, status: { in: ['pending', 'accepted'] } },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  return users.map((u) => {
    const friendRel = u.Friends_Friends_receiverIdToUsers[0] || u.Friends_Friends_senderIdToUsers[0];
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      friendStatus: friendRel?.status,
      friendSenderId: friendRel?.senderId,
      friendReceiverId: friendRel?.receiverId,
    };
  });
};

const getMyFriends = async (userId) => {
  const friends = await prisma.friends.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: 'accepted',
    },
    include: {
      Users_Friends_senderIdToUsers: true,
      Users_Friends_receiverIdToUsers: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return friends.map((f) => {
    const friendUser = f.senderId === userId ? f.Users_Friends_receiverIdToUsers : f.Users_Friends_senderIdToUsers;
    return {
      friendRequestId: f.id,
      status: f.status,
      createdAt: f.createdAt,
      friendId: friendUser?.id,
      friendName: friendUser?.fullName,
      friendEmail: friendUser?.email,
      phone: friendUser?.phone,
      avatar: friendUser?.avatar,
    };
  });
};

const getFriendRequests = async (userId) => {
  const requests = await prisma.friends.findMany({
    where: { receiverId: userId, status: 'pending' },
    include: { Users_Friends_senderIdToUsers: true },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((f) => ({
    requestId: f.id,
    status: f.status,
    createdAt: f.createdAt,
    senderId: f.Users_Friends_senderIdToUsers?.id,
    senderName: f.Users_Friends_senderIdToUsers?.fullName,
    senderEmail: f.Users_Friends_senderIdToUsers?.email,
    phone: f.Users_Friends_senderIdToUsers?.phone,
    avatar: f.Users_Friends_senderIdToUsers?.avatar,
  }));
};

const sendFriendRequest = async (senderId, receiverId) => {
  const existing = await prisma.friends.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) return existing;

  return await prisma.friends.create({
    data: { senderId, receiverId, status: 'pending' },
  });
};

const acceptFriendRequest = async (requestId, userId) => {
  const req = await prisma.friends.findFirst({
    where: { id: requestId, receiverId: userId, status: 'pending' },
  });
  if (!req) return null;

  return await prisma.friends.update({
    where: { id: requestId },
    data: { status: 'accepted' },
  });
};

const rejectFriendRequest = async (requestId, userId) => {
  const req = await prisma.friends.findFirst({
    where: { id: requestId, receiverId: userId, status: 'pending' },
  });
  if (!req) return null;

  return await prisma.friends.update({
    where: { id: requestId },
    data: { status: 'rejected' },
  });
};

const removeFriend = async (requestId, userId) => {
  const req = await prisma.friends.findFirst({
    where: {
      id: requestId,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
  });
  if (!req) return null;

  return await prisma.friends.delete({
    where: { id: requestId },
  });
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
