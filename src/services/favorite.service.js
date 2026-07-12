const { prisma } = require('../config/db');

const getMyFavorites = async (userId) => {
  const favorites = await prisma.favorites.findMany({
    where: { userId },
    include: { Tours: true },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => ({
    favoriteId: f.id,
    favoriteCreatedAt: f.createdAt,
    ...f.Tours,
  }));
};

const addFavorite = async (userId, tourId) => {
  const existing = await prisma.favorites.findFirst({
    where: { userId, tourId },
  });

  if (existing) {
    return existing;
  }

  return await prisma.favorites.create({
    data: { userId, tourId },
  });
};

const removeFavorite = async (userId, tourId) => {
  const existing = await checkFavorite(userId, tourId);
  if (existing) {
    await prisma.favorites.delete({
      where: { id: existing.id },
    });
    return existing;
  }
  return null;
};

const checkFavorite = async (userId, tourId) => {
  return await prisma.favorites.findFirst({
    where: { userId, tourId },
  });
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};