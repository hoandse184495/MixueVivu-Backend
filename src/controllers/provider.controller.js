const providerService = require('../services/provider.service');

const getProviderStats = async (req, res, next) => {
  try {
    const data = await providerService.getProviderStats(req.user.id);
    res.status(200).json({ message: 'Get provider stats successfully', data });
  } catch (error) {
    next(error);
  }
};

const getProviderRevenueByMonth = async (req, res, next) => {
  try {
    const data = await providerService.getProviderRevenueByMonth(req.user.id);
    res.status(200).json({ message: 'Get provider revenue successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProviderStats, getProviderRevenueByMonth };
