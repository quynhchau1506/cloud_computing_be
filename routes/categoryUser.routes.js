const express = require('express');
const { listCategories, getCategory } = require('../controllers/categoryUser.controller');

const router = express.Router();

router.get('/categories', listCategories);
router.get('/categories/:id', getCategory);

module.exports = router;
