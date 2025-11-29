const express = require('express');
const { createCategory, updateCategory, deleteCategory } = require('../controllers/categoryAdmin.controller');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/categories', requireAdmin, upload.single('image'), createCategory);
router.put('/categories/:id', requireAdmin, upload.single('image'), updateCategory);
router.delete('/categories/:id', requireAdmin, deleteCategory);

module.exports = router;
