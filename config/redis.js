const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis connection failed after 10 retries');
        return new Error('Redis retry limit exceeded');
      }
      return retries * 100; // Reconnect after retries * 100ms
    }
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('🔄 Redis connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis connected and ready');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

redisClient.on('end', () => {
  console.log('❌ Redis connection closed');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Redis connection error:', err.message);
    console.warn('⚠️  Application will continue without Redis cache');
  }
})();

module.exports = redisClient;
