const axios = require('axios');

const fetchCryptoNews = async () => {
    const query = 'cryptocurrency OR bitcoin OR ethereum OR blockchain OR crypto OR NFTs OR altcoins';
    const language = 'en';
    const url = `https://newsdata.io/api/1/news`;

    try {
        const response = await axios.get(url, {
            params: {
                apikey: 'pub_609358718fb5d96454df372eedb39e4280eeb',
                q: query,
                language: language,
            },
        });

        // 处理新闻数据
        return response.data.results.map((item) => ({
            title: item.title,
            link: item.link,
            published: item.pubDate,
            source: item.source_id,
        }));
    } catch (error) {
        console.error('Error fetching news from API:', error.message);
        throw new Error('Failed to fetch news');
    }
};

module.exports = { fetchCryptoNews };