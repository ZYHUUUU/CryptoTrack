const axios = require("axios");

const fetchCryptoPrices = async (ids, vs_currency) => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids,
                vs_currencies: vs_currency,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching crypto prices:", error.message);
        throw new Error("Failed to fetch crypto prices");
    }
};

module.exports = { fetchCryptoPrices };