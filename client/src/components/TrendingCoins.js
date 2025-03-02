import React, { useEffect, useState } from "react";
import axios from "axios";
import TrendingCoinItem from "./TrendingCoinItem";

const TRENDING_CACHE_KEY = "trending_coins_cache";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 分钟（单位：毫秒）

function TrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 读取本地缓存
  const loadFromCache = () => {
    const cachedData = localStorage.getItem(TRENDING_CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        console.log("📦 加载缓存的 Trending Coins...");
        return data;
      }
    }
    return null;
  };

  // 获取 Trending Coins 数据
  const fetchTrendingCoins = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🌐 正在请求 Trending Coins API...");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/trending`);
      
      if (response.data?.coins) {
        const sortedCoins = response.data.coins.sort(
          (a, b) => a.item.market_cap_rank - b.item.market_cap_rank
        );
        setTrendingCoins(sortedCoins);
        localStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify({ data: sortedCoins, timestamp: Date.now() }));
      } else {
        console.error("❌ API 数据格式错误:", response.data);
        setTrendingCoins([]);
      }
    } catch (err) {
      console.error("❌ API 请求失败，使用缓存:", err);
      setTrendingCoins(loadFromCache() || []);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedCoins = loadFromCache();
    if (cachedCoins) {
      setTrendingCoins(cachedCoins);
      setLoading(false);
    } else {
      fetchTrendingCoins();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchTrendingCoins, CACHE_EXPIRY);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="coins-container">
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>15 Trending Coins</h2>
        <button className="refresh-button" onClick={fetchTrendingCoins} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
      <ul className="coins-grid">
        {trendingCoins.map((coin) => (
          <TrendingCoinItem key={coin.item.id} coin={coin} />
        ))}
      </ul>
    </div>
  );
}

export default TrendingCoins;
