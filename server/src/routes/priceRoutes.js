const express = require("express");
const { getCryptoPrices } = require("../controllers/priceController");
const router = express.Router();

router.get("/price", getCryptoPrices);

module.exports = router;

