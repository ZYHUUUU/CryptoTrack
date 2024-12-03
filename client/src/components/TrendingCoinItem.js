import React from "react";
import { Link } from "react-router-dom";

const formatNumber = (num) =>
  num ? Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : "N/A";

const TrendingCoinItem = ({ coin }) => {
  return (
    // 将整个卡片用 Link 包裹
    <Link to={`/coin/${coin.item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <li className="coin-item">
        <img src={coin.item.thumb} alt={`${coin.item.name} logo`} width="50" height="50" />
        <br />
        <strong style={{ color: "#00FF00" }}>{coin.item.symbol.toUpperCase()}</strong>
        <br />
        Price (USD): {formatNumber(coin.item.data?.price)}
        <br />
        Market Cap: {coin.item.data?.market_cap || "N/A"}
        <br />
        24h Change (USD): {coin.item.data?.price_change_percentage_24h?.usd 
          ? `${coin.item.data.price_change_percentage_24h.usd.toFixed(2)}%`
          : "N/A"}
        <br />
        Trading Volume (USD): 
        <br />
        {coin.item.data?.total_volume || "N/A"}
        <br />
        <p style={{ textAlign: "center", margin: "5px 0", color: "#fff" }}>7 Days Price Trend:</p>
        <img
          src={coin.item.data.sparkline}
          alt={`${coin.item.name} price trend`}
          width="150"
          height="40"
        />
      </li>
    </Link>
  );
};

export default TrendingCoinItem;
