import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const CACHE_KEY_INFO = "coin_info_cache";
const CACHE_KEY_DATA = "coin_chart_cache";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 分钟缓存

const Page = () => {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [marketCapData, setMarketCapData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [coinInfo, setCoinInfo] = useState(null);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  const charts = [
    { title: "Price Trends", dataKey: "price", data: chartData, color: "#00FF00" },
    { title: "Market Cap Trends", dataKey: "marketCap", data: marketCapData, color: "#FF0000" },
    { title: "Trading Volume Trends", dataKey: "volume", data: volumeData, color: "#0000FF" },
  ];

  // ✅ 提取缓存数据的函数
  const loadFromCache = (key) => {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        console.log(`📦 加载缓存数据 (${key})`);
        return data;
      }
    }
    return null;
  };

  // ✅ 获取 `Coin` 详细信息
  const fetchCoinInfo = async () => {
    const cacheKey = `${CACHE_KEY_INFO}_${coinId}`;
    const cachedInfo = loadFromCache(cacheKey);
    if (cachedInfo) {
      setCoinInfo(cachedInfo);
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/coins/${coinId}`);
      const data = await response.json();
      setCoinInfo({ name: data.name, symbol: data.symbol.toUpperCase(), image: data.image.large });
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error("❌ 获取 Coin 详细信息失败:", error);
    }
  };

  // ✅ 获取 `Chart` 数据
  const fetchChartData = async () => {
    setLoading(true);
    setError(false);

    const cacheKey = `${CACHE_KEY_DATA}_${coinId}_${timeRange}`;
    const cachedData = localStorage.getItem(cacheKey);

    // ✅ 先检查缓存是否有效
    if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
            console.log("📦 使用缓存数据，避免 API 请求");
            setChartData(data.chartData);
            setMarketCapData(data.marketCapData);
            setVolumeData(data.volumeData);
            setLoading(false);
            return;
        }
    }

    // ✅ 只在缓存过期时请求 API
    try {
        console.log("🌐 请求 API:", `$${process.env.REACT_APP_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${timeRange}`);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${timeRange}`);
        
        console.log("📊 API 响应状态:", response.status);
        if (!response.ok) throw new Error(`API 请求失败: ${response.status}`);

        const data = await response.json();
        if (!data.prices) throw new Error("No data available");

        const formattedData = {
            chartData: data.prices.map(([t, p]) => ({ time: t, price: parseFloat(p.toFixed(3)) })),
            marketCapData: data.market_caps.map(([t, m]) => ({ time: t, marketCap: parseFloat(m.toFixed(3)) })),
            volumeData: data.total_volumes.map(([t, v]) => ({ time: t, volume: parseFloat(v.toFixed(3)) })),
        };

        setChartData(formattedData.chartData);
        setMarketCapData(formattedData.marketCapData);
        setVolumeData(formattedData.volumeData);

        // ✅ 更新缓存
        localStorage.setItem(cacheKey, JSON.stringify({ data: formattedData, timestamp: Date.now() }));
    } catch (error) {
        console.error("❌ 获取图表数据失败:", error);
        setError(true);
    }
    setLoading(false);
};



  const formatXAxis = (time) => {
    const date = new Date(time);
    if (timeRange === "1") {
        return `${date.getHours()}:00`; // 显示小时
    } else if (timeRange === "7" || timeRange === "30") {
        return `${date.getMonth() + 1}/${date.getDate()}`; // 显示 月/日
    } else if (timeRange === "365") {
        return date.toLocaleString("en", { month: "short" }); // 显示月份
    }
    return time;
};


  // ✅ 确保 `useEffect` 放在 return 语句之前
  useEffect(() => {
    if (!coinId) return; // 确保 coinId 存在，否则不请求 API
    fetchCoinInfo();
    fetchChartData();
  }, [coinId, timeRange]); // 只有 coinId 或 timeRange 变化时才执行


  const handlePreviousChart = () => {
    setCurrentChartIndex((prevIndex) => (prevIndex === 0 ? charts.length - 1 : prevIndex - 1));
  };

  const handleNextChart = () => {
    setCurrentChartIndex((prevIndex) => (prevIndex === charts.length - 1 ? 0 : prevIndex + 1));
  };

  if (loading) {
    return <div style={{ color: "green", textAlign: "center" }}>Loading chart data...</div>;
  }

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>Failed to fetch chart data. Please try again.</div>;
  }

  return (
    <div style={{ color: "#fff", padding: "20px", background: "#000" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Back
      </button>

      <h1 style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {coinInfo && (
          <img
            src={coinInfo.image}
            alt={`${coinInfo.name} logo`}
            style={{ width: "40px", height: "40px", marginRight: "10px" }}
          />
        )}
        {coinInfo?.name} ({coinInfo?.symbol})
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setTimeRange("1")}
          style={{
            backgroundColor: timeRange === "1" ? "#007bff" : "#fff",
            color: timeRange === "1" ? "#fff" : "#000",
            border: "1px solid #007bff",
            borderRadius: "5px",
            padding: "10px 20px",
            margin: "5px",
          }}
        >
          1 Day
        </button>
        <button
          onClick={() => setTimeRange("7")}
          style={{
            backgroundColor: timeRange === "7" ? "#007bff" : "#fff",
            color: timeRange === "7" ? "#fff" : "#000",
            border: "1px solid #007bff",
            borderRadius: "5px",
            padding: "10px 20px",
            margin: "5px",
          }}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange("30")}
          style={{
            backgroundColor: timeRange === "30" ? "#007bff" : "#fff",
            color: timeRange === "30" ? "#fff" : "#000",
            border: "1px solid #007bff",
            borderRadius: "5px",
            padding: "10px 20px",
            margin: "5px",
          }}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange("365")}
          style={{
            backgroundColor: timeRange === "365" ? "#007bff" : "#fff",
            color: timeRange === "365" ? "#fff" : "#000",
            border: "1px solid #007bff",
            borderRadius: "5px",
            padding: "10px 20px",
            margin: "5px",
          }}
        >
          1 Year
        </button>
      </div>

      <div style={{ position: "relative", margin: "20px 0" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          {charts[currentChartIndex].title}
        </h2>
        <button
          onClick={handlePreviousChart}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "10px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ‹
        </button>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={charts[currentChartIndex].data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              domain={[
                charts[currentChartIndex].data[0]?.time,
                charts[currentChartIndex].data[charts[currentChartIndex].data.length - 1]?.time,
              ]}
              tickFormatter={formatXAxis}
              ticks={
                charts[currentChartIndex].data.length > 7
                  ? charts[currentChartIndex].data
                      .filter((_, index) =>
                        index % Math.floor(charts[currentChartIndex].data.length / 7) === 0
                      )
                      .map((data) => data.time)
                  : charts[currentChartIndex].data.map((data) => data.time)
              }
              type="number"
              tick={{ fill: "white" }}
            />
            <YAxis tickFormatter={(tick) => tick.toFixed(3)} />
            <Tooltip
  cursor={false}
  content={({ payload, label }) => {
    if (payload && payload.length) {
      const date = new Date(label);
      return (
        <div
          style={{
            backgroundColor: "#001f3f",
            color: "#fff",
            padding: "10px",
            border: "1px solid #fff",
            borderRadius: "5px",
          }}
        >
          <p>
            Date:{" "}
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p>
            {charts[currentChartIndex].dataKey === "price"
              ? "Price"
              : charts[currentChartIndex].dataKey === "marketCap"
              ? "Market Cap"
              : "Volume"}{" "}
            : {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  }}
/>

            <Line
              type="monotone"
              dataKey={charts[currentChartIndex].dataKey}
              stroke={charts[currentChartIndex].color}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <button
          onClick={handleNextChart}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "10px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Page;



  