const express = require('express');
const router = express.Router();
const redis = require('redis');
const redisClient = redis.createClient();

const { getCryptoNews } = require('../controllers/newsController');

router.get('/', async (req, res) => {
    const redisClient = req.redisClient;
    await getCryptoNews(req, res, redisClient);
});

module.exports = router;
