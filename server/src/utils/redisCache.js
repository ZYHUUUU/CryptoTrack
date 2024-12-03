const getFromCache = async (redisClient, key) => {
    try {
        const cachedData = await redisClient.get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error(`Error getting data from cache for key: ${key}`, error.message);
        return null;
    }
};

const setToCache = async (redisClient, key, value, ttl) => {
    try {
        await redisClient.set(key, JSON.stringify(value), { EX: ttl });
        console.log(`Data cached with key: ${key}`);
    } catch (error) {
        console.error(`Error setting data to cache for key: ${key}`, error.message);
    }
};

module.exports = { getFromCache, setToCache };
