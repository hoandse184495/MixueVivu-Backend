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

const createActivity = async (activityData) => {
  return await prisma.tourActivities.create({
    data: {
      tourId: activityData.tourId,
      title: activityData.title,
      activityTime: activityData.activityTime || '',
      location: activityData.location || '',
      description: activityData.description || '',
      image: activityData.image || '',
    },
  });
};

const updateActivity = async (id, activityData) => {
  return await prisma.tourActivities.update({
    where: { id },
    data: {
      title: activityData.title,
      activityTime: activityData.activityTime || '',
      location: activityData.location || '',
      description: activityData.description || '',
      image: activityData.image || '',
    },
  });
};

const deleteActivity = async (id) => {
  return await prisma.tourActivities.delete({
    where: { id },
  });
};

module.exports = {
  getActivitiesByTourId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};