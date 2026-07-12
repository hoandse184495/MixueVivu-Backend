const { prisma } = require('../config/db');

// ========== Category CRUD ==========

const getAllCategories = async () => {
  return await prisma.categories.findMany({
    orderBy: { name: 'asc' },
  });
};

const getCategoryById = async (id) => {
  return await prisma.categories.findUnique({ where: { id } });
};

const createCategory = async ({ name, slug, image }) => {
  return await prisma.categories.create({
    data: { name, slug, image: image || null },
  });
};

const updateCategory = async (id, { name, slug, image, isActive }) => {
  return await prisma.categories.update({
    where: { id },
    data: { name, slug, image, isActive },
  });
};

const deleteCategory = async (id) => {
  return await prisma.categories.delete({ where: { id } });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
