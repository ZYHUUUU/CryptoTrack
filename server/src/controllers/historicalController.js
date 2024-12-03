const { getHistoricalData } = require('../services/historicalService');
const { getFromCache, setToCache } = require('../utils/redisCache');

const fetchHistoricalData = async (req, res, redisClient) => {
  const { coin } = req.params;
  const { days, vs_currency } = req.query;
  const requestedDays = days || 7; 
  const requestedCurrency = vs_currency || 'usd';

  const cacheKey = `historical-${coin}-${requestedDays}-${requestedCurrency}`;

  try {
    const cachedData = await getFromCache(redisClient, cacheKey);
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.json(cachedData);
    }

    const historicalData = await getHistoricalData(coin, requestedDays, requestedCurrency);

    await setToCache(redisClient, cacheKey, historicalData, 3600);

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    res.status(500).json({ error: 'Unable to fetch historical data' });
  }
};

module.exports = { fetchHistoricalData };
