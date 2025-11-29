const News = require('../models/News');

exports.createNews = async (req, res, next) => {
  try {
    const news = await News.create(req.body);
    await news.populate('category', 'name description');
    res.status(201).json({ data: news });
  } catch (err) {
    next(err);
  }
};

exports.updateNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name description');
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json({ data: news });
  } catch (err) {
    next(err);
  }
};

exports.deleteNews = async (req, res, next) => {
  try {
    const result = await News.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'News not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
