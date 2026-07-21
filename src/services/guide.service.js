const { prisma } = require('../config/db');

const getAllGuides = async () => {
  return await prisma.guides.findMany({
    where: { isActive: true },
    orderBy: { fullName: 'asc' },
  });
};

const getGuideById = async (id) => {
  return await prisma.guides.findUnique({
    where: { id: Number(id) },
  });
};

const createGuide = async ({
  fullName,
  email,
  phone,
  experience,
  language,
  rating,
  avatar,
}) => {
  return await prisma.guides.create({
    data: {
      fullName,
      email,
      phone: phone || '',
      experience: experience || '',
      language: language || '',
      rating: rating === undefined ? 0 : Number(rating),
      avatar: avatar || '',
    },
  });
};

const updateGuide = async (
  id,
  { fullName, email, phone, experience, language, rating, avatar, isActive }
) => {
  return await prisma.guides.update({
    where: { id: Number(id) },
    data: {
      fullName,
      email,
      phone: phone || '',
      experience: experience || '',
      language: language || '',
      rating: rating === undefined ? undefined : Number(rating),
      avatar: avatar || '',
      isActive,
    },
  });
};

const deleteGuide = async (id) => {
  return await prisma.guides.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
};

module.exports = {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
};
