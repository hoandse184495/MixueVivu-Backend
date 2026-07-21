const tourService = require('../services/tour.service');

const getAllTours = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, startDate, minAvailableSlots } = req.query;
    const isInvalidNumber = (value) =>
      value !== undefined &&
      value !== '' &&
      (!Number.isFinite(Number(value)) || Number(value) < 0);

    if (
      isInvalidNumber(minPrice) ||
      isInvalidNumber(maxPrice) ||
      isInvalidNumber(minAvailableSlots)
    ) {
      return res.status(400).json({
        message: 'Price and available slots must be non-negative numbers',
      });
    }

    if (
      minAvailableSlots !== undefined &&
      minAvailableSlots !== '' &&
      !Number.isInteger(Number(minAvailableSlots))
    ) {
      return res.status(400).json({
        message: 'Available slots must be a whole number',
      });
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        message: 'Minimum price cannot be greater than maximum price',
      });
    }

    const parsedStartDate = startDate
      ? new Date(`${startDate}T00:00:00.000Z`)
      : null;
    const isValidStartDate =
      !startDate ||
      (/^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
        !Number.isNaN(parsedStartDate.getTime()) &&
        parsedStartDate.toISOString().slice(0, 10) === startDate);

    if (!isValidStartDate) {
      return res.status(400).json({ message: 'Start date must use YYYY-MM-DD format' });
    }

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
    const tour = await tourService.updateTour(req.params.id, req.body, req.user);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found or you do not have permission',
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
    const tour = await tourService.deleteTour(req.params.id, req.user);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found or you do not have permission',
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
    const tour = await tourService.approveTour(Number(req.params.id));

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
      Number(req.params.id),
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

const resubmitTour = async (req, res, next) => {
  try {
    const tour = await tourService.resubmitTour(Number(req.params.id), req.user.id);

    if (!tour) {
      return res.status(404).json({
        message: 'Rejected tour not found or you do not have permission',
      });
    }

    res.status(200).json({
      message: 'Resubmit tour successfully',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

const hideTour = async (req, res, next) => {
  try {
    const tour = await tourService.hideTour(Number(req.params.id));

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      message: 'Hide tour successfully',
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

const completeTour = async (req, res, next) => {
  try {
    const tour = await tourService.completeTour(Number(req.params.id), req.user.id);

    if (!tour) {
      return res.status(404).json({
        message: 'Tour not found or you do not have permission',
      });
    }

    res.status(200).json({
      message: 'Tour marked as completed successfully',
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
  resubmitTour,
  hideTour,
  completeTour,
};
