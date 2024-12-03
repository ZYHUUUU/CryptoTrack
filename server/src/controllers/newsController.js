const { fetchCryptoNews } = require('../services/newsService');
const { getFromCache, setToCache } = require('../utils/redisCache');

const getCryptoNews = async (req, res) => {
    const cacheKey = 'cryptoNews';
    const redisClient = req.redisClient;

    try {
        const cachedData = await getFromCache(redisClient, cacheKey);
        if (cachedData) {
            console.log('Cache hit for cryptoNews');
            return res.json(cachedData);
        }
        const news = await fetchCryptoNews();

        await setToCache(redisClient, cacheKey, news, 3600);

        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Unable to fetch news' });
    }
};

module.exports = { getCryptoNews };