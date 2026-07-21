const activityService = require('../services/activity.service');

const getActivitiesByTourId = async (req, res, next) => {
  try {
    const activities = await activityService.getActivitiesByTourId(req.params.tourId);

    res.status(200).json({
      message: 'Get tour activities successfully',
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

const getActivityById = async (req, res, next) => {
  try {
    const activity = await activityService.getActivityById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        message: 'Activity not found',
      });
    }

    res.status(200).json({
      message: 'Get activity detail successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const activity = await activityService.createActivity(req.body, req.user);

    if (!activity) {
      return res.status(404).json({
        message: 'Tour not found or you do not have permission',
      });
    }

    res.status(201).json({
      message: 'Create activity successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.body, req.user);

    if (!activity) {
      return res.status(404).json({
        message: 'Activity not found or you do not have permission',
      });
    }

    res.status(200).json({
      message: 'Update activity successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const activity = await activityService.deleteActivity(req.params.id, req.user);

    if (!activity) {
      return res.status(404).json({
        message: 'Activity not found or you do not have permission',
      });
    }

    res.status(200).json({
      message: 'Delete activity successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivitiesByTourId,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
