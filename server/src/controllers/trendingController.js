const { getTrendingCoins } = require('../services/coingeckoService');
const { getFromCache, setToCache } = require('../utils/redisCache');

const fetchTrendingCoins = async (req, res) => {
  const cacheKey = 'trendingCoins';
  const redisClient = req.redisClient;

  try {
    const cachedData = await getFromCache(redisClient, cacheKey);
    if (cachedData) {
      console.log('Cache hit for trendingCoins');
      return res.json(cachedData);
    }
    const trendingData = await getTrendingCoins();
    await setToCache(redisClient, cacheKey, trendingData, 3600);
    res.json(trendingData);
  } catch (error) {
    console.error('Error fetching trending coins:', error.message);
    res.status(500).json({ error: 'Unable to fetch trending coins' });
  }
};

module.exports = { fetchTrendingCoins };

