const express = require('express');
const router = express.Router();
const { fetchHistoricalData } = require('../controllers/historicalController');
router.get('/historical/:coin', async (req, res) => {
    const redisClient = req.redisClient;
    await fetchHistoricalData(req, res, redisClient);
});

module.exports = router;
