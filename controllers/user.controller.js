const News = require('../models/News');

exports.listNews = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    
    // Build query filter
    const filter = {};
    
    // Search by title (case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    // Filter by category
    if (category) {
      filter.category = category;
    }
    
    const news = await News.find(filter)
      .populate('category', 'name description')
      .sort({ publishedDate: -1 });
      
    res.json({ data: news });
  } catch (err) {
    next(err);
  }
};

exports.getNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('category', 'name description');
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json({ data: news });
  } catch (err) {
    next(err);
  }
};
