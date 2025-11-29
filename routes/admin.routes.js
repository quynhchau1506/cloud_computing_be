const express = require('express');
const { createNews, updateNews, deleteNews } = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/news', requireAdmin, createNews);
router.put('/news/:id', requireAdmin, updateNews);
router.delete('/news/:id', requireAdmin, deleteNews);

module.exports = router;
