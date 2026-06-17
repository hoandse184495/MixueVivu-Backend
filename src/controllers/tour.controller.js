const tourService = require('../services/tour.service');

const getAllTours = async (req, res, next) => {
  try {
    const tours = await tourService.getAllTours(req.query);

    res.status(200).json({
      message: 'Get tours successfully',
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

const getTourById = async (req, res, next) => {
  try {
    const tour = await tourService.getTourById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      message: 'Get tour detail successfully',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

const createTour = async (req, res, next) => {
  try {
    const tour = await tourService.createTour(req.body, req.user.id);

    res.status(201).json({
      message: 'Create tour successfully, waiting for manager approval',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

const updateTour = async (req, res, next) => {
  try {
    const tour = await tourService.updateTour(req.params.id, req.body);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      message: 'Update tour successfully',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTour = async (req, res, next) => {
  try {
    const tour = await tourService.deleteTour(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      message: 'Delete tour successfully',
    });
  } catch (error) {
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const review = await tourService.addReview({
      userId: req.user.id,
      tourId: req.params.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json({
      message: 'Add review successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const getMyTours = async (req, res, next) => {
  try {
    const tours = await tourService.getMyTours(req.user.id);

    res.status(200).json({
      message: 'Get my tours successfully',
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingTours = async (req, res, next) => {
  try {
    const tours = await tourService.getPendingTours();

    res.status(200).json({
      message: 'Get pending tours successfully',
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

const approveTour = async (req, res, next) => {
  try {
    const tour = await tourService.approveTour(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      message: 'Approve tour successfully',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

const rejectTour = async (req, res, next) => {
  try {
    const tour = await tourService.rejectTour(
      req.params.id,
      req.body.rejectReason
    );

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      message: 'Reject tour successfully',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  addReview,
  getMyTours,
  getPendingTours,
  approveTour,
  rejectTour,
};