const axios = require('axios');

const fetchCoinList = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching coin list from API:', error.message);
    throw new Error('Failed to fetch coin list');
  }
};

module.exports = { fetchCoinList };

