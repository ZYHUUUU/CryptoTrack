
const express = require('express');
const { fetchTrendingCoins } = require('../controllers/trendingController');
const router = express.Router();

router.get('/trending', async (req, res) => {
  const redisClient = req.redisClient;
  await fetchTrendingCoins(req, res, redisClient);
});

module.exports = router;
