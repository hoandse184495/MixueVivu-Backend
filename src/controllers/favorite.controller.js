const favoriteService = require('../services/favorite.service');

const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getMyFavorites(req.user.id);

    res.status(200).json({
      message: 'Get my favorites successfully',
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({
        message: 'Tour id is required',
      });
    }

    const favorite = await favoriteService.addFavorite(req.user.id, Number(tourId));

    res.status(201).json({
      message: 'Add favorite successfully',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.removeFavorite(
      req.user.id,
      Number(req.params.tourId)
    );

    if (!favorite) {
      return res.status(404).json({
        message: 'Favorite not found',
      });
    }

    res.status(200).json({
      message: 'Remove favorite successfully',
    });
  } catch (error) {
    next(error);
  }
};

const checkFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.checkFavorite(
      req.user.id,
      Number(req.params.tourId)
    );

    res.status(200).json({
      message: 'Check favorite successfully',
      data: {
        isFavorite: !!favorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};