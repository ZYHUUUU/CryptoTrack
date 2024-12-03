const axios = require('axios');
const getHistoricalData = async (coin, days, vs_currency) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart`, {
      params: {
        vs_currency,
        days,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error in getHistoricalData: ${error.message}`);
    throw new Error('Failed to fetch historical data from CoinGecko');
  }
};

module.exports = { getHistoricalData };