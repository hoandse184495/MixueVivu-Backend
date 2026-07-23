const { prisma } = require('../config/db');

const createNotification = async (
  {
    userId,
    bookingId,
    tourId,
    paymentId,
    type,
    title,
    message,
    status,
  },
  client = prisma
) => {
  if (!userId || !type || !title || !message) return null;

  return await client.notifications.create({
    data: {
      userId,
      bookingId: bookingId || null,
      tourId: tourId || null,
      paymentId: paymentId || null,
      type,
      title,
      message,
      status: status || null,
    },
  });
};

const createManagerNotification = async (
  {
    bookingId,
    tourId,
    paymentId,
    type,
    title,
    message,
    status,
  },
  client = prisma
) => {
  if (!type || !title || !message) return null;

  const managers = await client.users.findMany({
    where: { role: 'manager' },
    select: { id: true },
  });

  if (managers.length === 0) return null;

  return await client.notifications.createMany({
    data: managers.map((manager) => ({
      userId: manager.id,
      bookingId: bookingId || null,
      tourId: tourId || null,
      paymentId: paymentId || null,
      type,
      title,
      message,
      status: status || null,
    })),
  });
};

const getMyNotifications = async (userId) => {
  return await prisma.notifications.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

const getUnreadCount = async (userId) => {
  return await prisma.notifications.count({
    where: { userId, isRead: false },
  });
};

const markAsRead = async (id, userId) => {
  return await prisma.notifications.updateMany({
    where: { id: Number(id), userId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notifications.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

module.exports = {
  createNotification,
  createManagerNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
