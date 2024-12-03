const axios = require('axios');

const getTrendingCoins = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending', {
      headers: {
        'accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch trending coins');
  }
};

module.exports = { getTrendingCoins };
