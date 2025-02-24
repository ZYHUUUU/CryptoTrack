import React, { useEffect, useState } from "react";
import axios from "axios";
import TrendingCoinItem from "./TrendingCoinItem";

function TrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingCoins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/trending`);
      const sortedCoins = response.data.coins.sort(
        (a, b) => a.item.market_cap_rank - b.item.market_cap_rank
      );
      setTrendingCoins(sortedCoins);
    } catch (err) {
      console.error("Error fetching trending coins:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingCoins();
    const interval = setInterval(fetchTrendingCoins, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="coins-container">
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Trending Coins</h2>
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
