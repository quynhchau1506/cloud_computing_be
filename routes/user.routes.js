const express = require('express');
const { listNews, getNews } = require('../controllers/user.controller');

const router = express.Router();

router.get('/news', listNews);
router.get('/news/:id', getNews);

module.exports = router;
