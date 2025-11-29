const Category = require('../models/Category');
const redisClient = require('../config/redis');

// Cache TTL (Time To Live) - 5 minutes
const CACHE_TTL = 300;

// Redis keys
const CATEGORIES_LIST_KEY = 'categories:list';
const CATEGORY_KEY_PREFIX = 'category:';

exports.listCategories = async (req, res, next) => {
  try {
    let categories = null;
    
    // 1. Try to get from Redis first
    try {
      if (redisClient.isReady) {
        const cachedData = await redisClient.get(CATEGORIES_LIST_KEY);
        if (cachedData) {
          categories = JSON.parse(cachedData);
          console.log('✅ Cache HIT: Categories loaded from Redis');
          return res.json({ data: categories, source: 'cache' });
        } else {
          console.log('❌ Cache MISS: Categories not found in Redis');
        }
      }
    } catch (redisError) {
      console.error('⚠️  Redis error:', redisError.message);
      // Continue to MongoDB if Redis fails
    }

    // 2. If not in Redis, get from MongoDB
    categories = await Category.find().sort({ name: 1 });
    console.log('📂 Categories loaded from MongoDB');

    // 3. Store in Redis for next time
    try {
      if (redisClient.isReady) {
        await redisClient.setEx(
          CATEGORIES_LIST_KEY,
          CACHE_TTL,
          JSON.stringify(categories)
        );
        console.log('💾 Categories cached in Redis for 5 minutes');
      }
    } catch (redisError) {
      console.error('⚠️  Redis cache save error:', redisError.message);
      // Continue even if cache save fails
    }

    res.json({ data: categories, source: 'database' });
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const cacheKey = `${CATEGORY_KEY_PREFIX}${categoryId}`;
    let category = null;

    // 1. Try to get from Redis first
    try {
      if (redisClient.isReady) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          category = JSON.parse(cachedData);
          console.log(`✅ Cache HIT: Category ${categoryId} loaded from Redis`);
          return res.json({ data: category, source: 'cache' });
        } else {
          console.log(`❌ Cache MISS: Category ${categoryId} not found in Redis`);
        }
      }
    } catch (redisError) {
      console.error('⚠️  Redis error:', redisError.message);
      // Continue to MongoDB if Redis fails
    }

    // 2. If not in Redis, get from MongoDB
    category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.log(`📂 Category ${categoryId} loaded from MongoDB`);

    // 3. Store in Redis for next time
    try {
      if (redisClient.isReady) {
        await redisClient.setEx(
          cacheKey,
          CACHE_TTL,
          JSON.stringify(category)
        );
        console.log(`💾 Category ${categoryId} cached in Redis for 5 minutes`);
      }
    } catch (redisError) {
      console.error('⚠️  Redis cache save error:', redisError.message);
      // Continue even if cache save fails
    }

    res.json({ data: category, source: 'database' });
  } catch (err) {
    next(err);
  }
};
