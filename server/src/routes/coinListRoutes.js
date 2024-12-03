const express = require('express');
const { getCoinList } = require('../controllers/coinListController');

const router = express.Router();

router.get('/', async (req, res) => {
  await getCoinList(req, res);
});

module.exports = router;
