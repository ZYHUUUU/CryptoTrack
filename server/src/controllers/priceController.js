const { fetchCryptoPrices } = require("../services/priceService");
const { getFromCache, setToCache } = require("../utils/redisCache");

const getCryptoPrices = async (req, res) => {
    const { ids, vs_currency = "usd" } = req.query;

    if (!ids) {
        return res.status(400).json({ error: "Parameter 'ids' is required" });
    }

    const cacheKey = `cryptoPrices:${ids}:${vs_currency}`;
    const redisClient = req.redisClient;

    try {
        const cachedData = await getFromCache(redisClient, cacheKey);
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(cachedData);
        }
        const prices = await fetchCryptoPrices(ids, vs_currency);
        await setToCache(redisClient, cacheKey, prices, 300);

        res.json(prices);
    } catch (error) {
        console.error("Error fetching crypto prices:", error.message);
        res.status(500).json({ error: "Unable to fetch crypto prices" });
    }
};

module.exports = { getCryptoPrices };
