const { fetchCoinList } = require('../services/coinListService');
const { getFromCache, setToCache } = require('../utils/redisCache');

const getCoinList = async (req, res) => {
  const cacheKey = 'coinList';
  const redisClient = req.redisClient; 

  try {
    const cachedData = await getFromCache(redisClient, cacheKey);
    if (cachedData) {
      console.log('Cache hit for coinList');
      return res.json(cachedData);
    }
    const coinList = await fetchCoinList();

    await setToCache(redisClient, cacheKey, coinList, 3600);

    res.json(coinList);
  } catch (error) {
    console.error('Error in getCoinList:', error.message);
    res.status(500).json({ error: 'Unable to fetch coin list' });
  }
};

module.exports = { getCoinList };
