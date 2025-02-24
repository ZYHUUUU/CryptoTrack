import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TrendingCoins from "./components/TrendingCoins";
import Page from "./components/Page";
import NewsCarousel from "./components/NewsCarousel";
import SearchPage from "./components/SearchPage";
import Register from "./components/Register";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Modal from "./components/Modal";
import FavouriteButton from "./components/FavouriteButton";
import { SpeedInsights } from "@vercel/speed-insights/react";  // ✅ 添加 Speed Insights

import "./App.css";
import { getAuth } from "firebase/auth";

function App() {
  const [coinsData, setCoinsData] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <div className="main-layout">
      <Menu />
      <div className="top-bar">
        <SearchPage setCoinsData={setCoinsData} />
      </div>
      <div className="news-content-layout">
        <div className="news-section">
          <h2>News Section</h2>
          <NewsCarousel />
        </div>
        <div className="content">
          {selectedCoin && (
            <div className="favourite-button-container">
              <FavouriteButton coinId={coinsData} />
            </div>
          )}
          <Routes>
            <Route
              path="/"
              element={<TrendingCoins setCoinsData={setCoinsData} />}
            />
            <Route
              path="/coin/:coinId"
              element={<Page coinsData={coinsData} />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
          </Routes>
        </div>
      </div>

      {/* ✅ 添加 Speed Insights 监控性能 */}
      <SpeedInsights />
    </div>
  );
}

export default App;
