const categoryService = require('../services/category.service');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ message: 'Get categories successfully', data: categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(Number(req.params.id));
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Get category successfully', data: category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await categoryService.createCategory({ name: name.trim(), slug, image });
    res.status(201).json({ message: 'Create category successfully', data: category });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category slug already exists' });
    }
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, image, isActive } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await categoryService.updateCategory(Number(req.params.id), {
      name: name.trim(), slug, image, isActive,
    });
    res.status(200).json({ message: 'Update category successfully', data: category });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Category not found' });
    if (error.code === 'P2002') return res.status(400).json({ message: 'Category slug already exists' });
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    res.status(200).json({ message: 'Delete category successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Category not found' });
    next(error);
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
