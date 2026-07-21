const guideService = require('../services/guide.service');

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value) => !value || /^[0-9+\-\s]{9,15}$/.test(value);

const mapGuideResponse = (guide) =>
  guide
    ? {
        ...guide,
        name: guide.fullName,
      }
    : guide;

const getAllGuides = async (req, res, next) => {
  try {
    const guides = await guideService.getAllGuides();
    res.status(200).json({
      message: 'Get guides successfully',
      data: guides.map(mapGuideResponse),
    });
  } catch (error) {
    next(error);
  }
};

const getGuideById = async (req, res, next) => {
  try {
    const guide = await guideService.getGuideById(req.params.id);
    if (!guide || !guide.isActive) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    res.status(200).json({
      message: 'Get guide successfully',
      data: mapGuideResponse(guide),
    });
  } catch (error) {
    next(error);
  }
};

const validateGuidePayload = (body) => {
  const fullName = normalizeText(body.fullName || body.name);
  const email = normalizeEmail(body.email);
  const phone = normalizeText(body.phone);

  if (!fullName || !email) {
    return { error: 'Guide name and email are required' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' };
  }

  if (!isValidPhone(phone)) {
    return { error: 'Phone number is invalid' };
  }

  return {
    data: {
      fullName,
      email,
      phone,
      experience: normalizeText(body.experience || body.bio),
      language: normalizeText(body.language),
      rating: body.rating,
      avatar: normalizeText(body.avatar),
      isActive: body.isActive,
    },
  };
};

const createGuide = async (req, res, next) => {
  try {
    const { data, error } = validateGuidePayload(req.body);
    if (error) return res.status(400).json({ message: error });

    const guide = await guideService.createGuide(data);
    res.status(201).json({
      message: 'Create guide successfully',
      data: mapGuideResponse(guide),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Guide email already exists' });
    }
    next(error);
  }
};

const updateGuide = async (req, res, next) => {
  try {
    const { data, error } = validateGuidePayload(req.body);
    if (error) return res.status(400).json({ message: error });

    const guide = await guideService.updateGuide(req.params.id, data);
    res.status(200).json({
      message: 'Update guide successfully',
      data: mapGuideResponse(guide),
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Guide not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Guide email already exists' });
    }
    next(error);
  }
};

const deleteGuide = async (req, res, next) => {
  try {
    await guideService.deleteGuide(req.params.id);
    res.status(200).json({ message: 'Delete guide successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Guide not found' });
    }
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
