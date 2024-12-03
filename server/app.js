const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();

app.use(cors());
app.use(express.json());

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis!');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

const apiRoutes = require('./src/routes/apiRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const coinListRoutes = require('./src/routes/coinListRoutes');
const historicalRoutes = require('./src/routes/historicalRoutes');
const priceRoutes = require('./src/routes/priceRoutes');

const PORT = process.env.PORT || 5001;

app.use('/api', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, apiRoutes);

app.use('/api/news', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, newsRoutes);

app.use('/api/coins', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, coinListRoutes);

app.use('/api/historical', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, historicalRoutes);

app.use("/prices", (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, priceRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', async () => {
    console.log('Closing Redis client...');
    try {
        await redisClient.quit();
        console.log('Redis client closed.');
    } catch (error) {
        console.error('Error while closing Redis client:', error);
    } finally {
        process.exit(0);
    }
});
