const express = require('express');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config(); // 让 Node.js 读取 .env 文件

const app = express();

app.use(cors());
app.use(express.json());

// 读取 Redis 连接信息
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || YkGCegni6k8T8nw3kxELDREfQd3G4Wst; // 如果 Redis 需要密码

const redisClient = redis.createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    password: REDIS_PASSWORD || undefined, // 仅当密码存在时才传入
});

// 监听 Redis 连接错误
redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log(`✅ Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
    }
})();

// 加载路由
const apiRoutes = require('./src/routes/apiRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const coinListRoutes = require('./src/routes/coinListRoutes');
const historicalRoutes = require('./src/routes/historicalRoutes');
const priceRoutes = require('./src/routes/priceRoutes');

const PORT = process.env.PORT || 5001;

// 使用 Redis 作为中间件
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

app.get('/', (req, res) => {
    res.send('CryptoTracker Backend is Running! 🚀');
});


// 服务器启动
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// 处理进程关闭时关闭 Redis 连接
process.on('SIGINT', async () => {
    console.log('🔴 Closing Redis client...');
    try {
        await redisClient.quit();
        console.log('✅ Redis client closed.');
    } catch (error) {
        console.error('❌ Error while closing Redis client:', error);
    } finally {
        process.exit(0);
    }
});
