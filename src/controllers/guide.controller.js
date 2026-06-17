const guideService = require('../services/guide.service');

const getAllGuides = async (req, res, next) => {
  try {
    const guides = await guideService.getAllGuides();

    res.status(200).json({
      message: 'Get guides successfully',
      data: guides,
    });
  } catch (error) {
    next(error);
  }
};

const getGuideById = async (req, res, next) => {
  try {
    const guide = await guideService.getGuideById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        message: 'Guide not found',
      });
    }

    res.status(200).json({
      message: 'Get guide detail successfully',
      data: guide,
    });
  } catch (error) {
    next(error);
  }
};

const createGuide = async (req, res, next) => {
  try {
    const guide = await guideService.createGuide(req.body);

    res.status(201).json({
      message: 'Create guide successfully',
      data: guide,
    });
  } catch (error) {
    next(error);
  }
};

const updateGuide = async (req, res, next) => {
  try {
    const guide = await guideService.updateGuide(req.params.id, req.body);

    if (!guide) {
      return res.status(404).json({
        message: 'Guide not found',
      });
    }

    res.status(200).json({
      message: 'Update guide successfully',
      data: guide,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGuide = async (req, res, next) => {
  try {
    const guide = await guideService.deleteGuide(req.params.id);

    if (!guide) {
      return res.status(404).json({
        message: 'Guide not found',
      });
    }

    res.status(200).json({
      message: 'Delete guide successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
};