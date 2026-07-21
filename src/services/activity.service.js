const { prisma } = require('../config/db');

const getActivitiesByTourId = async (tourId) => {
  return await prisma.tourActivities.findMany({
    where: { tourId },
    orderBy: { id: 'asc' },
  });
};

const getActivityById = async (id) => {
  return await prisma.tourActivities.findUnique({
    where: { id },
  });
};

const canManageTour = async (tourId, user) => {
  if (user?.role === 'manager') return true;
  if (user?.role !== 'provider') return false;

  const tour = await prisma.tours.findFirst({
    where: { id: Number(tourId), providerId: user.id },
  });

  return Boolean(tour);
};

const createActivity = async (activityData, user) => {
  if (!(await canManageTour(activityData.tourId, user))) return null;

  return await prisma.tourActivities.create({
    data: {
      tourId: Number(activityData.tourId),
      title: activityData.title,
      activityTime: activityData.activityTime || '',
      location: activityData.location || '',
      description: activityData.description || '',
      image: activityData.image || '',
    },
  });
};

const updateActivity = async (id, activityData, user) => {
  const existing = await prisma.tourActivities.findUnique({
    where: { id: Number(id) },
  });
  if (!existing || !(await canManageTour(existing.tourId, user))) return null;

  return await prisma.tourActivities.update({
    where: { id: Number(id) },
    data: {
      title: activityData.title,
      activityTime: activityData.activityTime || '',
      location: activityData.location || '',
      description: activityData.description || '',
      image: activityData.image || '',
    },
  });
};

const deleteActivity = async (id, user) => {
  const existing = await prisma.tourActivities.findUnique({
    where: { id: Number(id) },
  });
  if (!existing || !(await canManageTour(existing.tourId, user))) return null;

  return await prisma.tourActivities.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  getActivitiesByTourId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
