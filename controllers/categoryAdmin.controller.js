const Category = require('../models/Category');
const { deleteFile } = require('./upload.controller');
const redisClient = require('../config/redis');

// Redis cache invalidation helper
const invalidateCategoryCache = async (categoryId = null) => {
  try {
    if (!redisClient.isReady) return;

    const keys = ['categories:list'];
    
    if (categoryId) {
      keys.push(`category:${categoryId}`);
    }

    await redisClient.del(keys);
    console.log('🗑️  Cache invalidated:', keys.join(', '));
  } catch (err) {
    console.error('⚠️  Cache invalidation error:', err.message);
    // Don't throw error, just log it
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const categoryData = { ...req.body };

    // If image was uploaded
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      categoryData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      categoryData.imagePath = req.file.path;
    }

    const category = await Category.create(categoryData);
    
    // Invalidate categories list cache
    await invalidateCategoryCache();
    
    res.status(201).json({ data: category });
  } catch (err) {
    // Delete uploaded file if category creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      // Delete uploaded file if category not found
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(404).json({ error: 'Category not found' });
    }

    const updateData = { ...req.body };

    // If new image was uploaded
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      updateData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      updateData.imagePath = req.file.path;

      // Delete old image
      if (oldCategory.imagePath) {
        deleteFile(oldCategory.imagePath);
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Invalidate both list and specific category cache
    await invalidateCategoryCache(req.params.id);

    res.json({ data: category });
  } catch (err) {
    // Delete uploaded file if update fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete associated image
    if (category.imagePath) {
      deleteFile(category.imagePath);
    }

    await Category.findByIdAndDelete(req.params.id);
    
    // Invalidate both list and specific category cache
    await invalidateCategoryCache(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
