const express = require('express');
const { createCategory, updateCategory, deleteCategory } = require('../controllers/categoryAdmin.controller');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/categories', requireAdmin, createCategory);
router.put('/categories/:id', requireAdmin, updateCategory);
router.delete('/categories/:id', requireAdmin, deleteCategory);

module.exports = router;
