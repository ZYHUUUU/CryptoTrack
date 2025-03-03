import axios from "axios";
import React, { useState, useEffect } from "react";
import _ from "lodash";
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
  const id = typeof coinId === "object" ? coinId.id : coinId;
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
    try {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            if (parsedData.timestamp && Date.now() - parsedData.timestamp < CACHE_EXPIRY) {
                console.log(`📦 成功加载缓存数据 (${key})`);
                return parsedData;
            }
        }
    } catch (error) {
        console.warn("⚠️ 解析缓存失败:", error);
    }
    return null;
};


  // ✅ 获取 `Coin` 详细信息
  const fetchCoinInfo = async () => {
    const cacheKey = `coin_info_cache_${coinId}`;
    const cachedInfo = JSON.parse(localStorage.getItem(cacheKey));

    // ✅ 先检查缓存数据是否存在
    if (cachedInfo && cachedInfo.name) {
        console.log("📦 使用缓存数据:", cachedInfo);
        setCoinInfo(cachedInfo);
        return;
    }

    // ✅ `last_fetch` 仅用于防止短时间重复请求，但不会影响 `coinInfo`
    const lastFetchTime = localStorage.getItem(`last_fetch_info_${coinId}`);
    if (lastFetchTime && Date.now() - lastFetchTime < 5 * 60 * 1000) {
        console.log("⏳ 最近已经请求过，跳过 API 请求");

        // 🚀 **确保 `setCoinInfo` 即使 API 被跳过也能正确赋值**
        if (cachedInfo && cachedInfo.name) {
            setCoinInfo(cachedInfo);
        } else {
            console.warn("⚠️ No cached info available, but skipping API request.");
        }
        return;
    }

    // ✅ 更新 `last_fetch`
    localStorage.setItem(`last_fetch_info_${coinId}`, Date.now());

    try {
        console.log("🌐 请求 Coin Info API:", `${process.env.REACT_APP_COIN_URL}/coins/${coinId}`);
        const response = await axios.get(`${process.env.REACT_APP_COIN_URL}/coins/${coinId}`);

        if (!response.data || !response.data.name) {
            throw new Error("❌ API 返回数据无效");
        }

        const coinData = {
            name: response.data.name,
            symbol: response.data.symbol.toUpperCase(),
            image: response.data.image.large,
        };

        console.log("✅ Coin Info 数据:", coinData);
        setCoinInfo(coinData);

        // ✅ 只存储必要字段，避免存储不必要的 JSON 结构
        localStorage.setItem(cacheKey, JSON.stringify(coinData));

    } catch (error) {
        console.error("❌ 获取 Coin Info 失败:", error);
        setError("Failed to load coin info.");
    }
  };





  // ✅ 获取 `Chart` 数据
  const fetchChartData = async () => {
    setLoading(true);
    setError(false);

    const globalCacheKey = `coin_chart_cache_${coinId}`;
    const cacheData = JSON.parse(localStorage.getItem(globalCacheKey)) || {};

    // ✅ 先检查 `localStorage` 是否有 `timeRange` 的缓存数据
    if (cacheData[timeRange] && cacheData[timeRange].chartData && Date.now() - cacheData[timeRange].timestamp < CACHE_EXPIRY) {
        console.log("📦 使用缓存数据:", cacheData[timeRange]);
        setChartData(cacheData[timeRange].chartData);
        setMarketCapData(cacheData[timeRange].marketCapData);
        setVolumeData(cacheData[timeRange].volumeData);
        setLoading(false);
        return;
    }

    // ✅ `lastFetchTime` 仅用于防止短时间重复请求 API，但不会影响 `timeRange` 切换
    const lastFetchTime = localStorage.getItem(`last_fetch_chart_${coinId}`);
    if (lastFetchTime && Date.now() - lastFetchTime < 5 * 60 * 1000) {
        console.log("⏳ 最近已经请求过，跳过 API 请求");

        // **🚀 关键修正：如果 `cacheData[timeRange]` 为空，则强制重新请求 API**
        if (cacheData[timeRange] && cacheData[timeRange].chartData) {
            setChartData(cacheData[timeRange].chartData);
            setMarketCapData(cacheData[timeRange].marketCapData);
            setVolumeData(cacheData[timeRange].volumeData);
            setLoading(false);
            return;
        } else {
            console.warn("⚠️ No cached data found for timeRange:", timeRange);
        }
    }

    // ✅ 更新 `last_fetch_chart`
    localStorage.setItem(`last_fetch_chart_${coinId}`, Date.now());

    try {
        console.log("🌐 请求 API:", `${process.env.REACT_APP_COIN_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${timeRange}`);
        const response = await axios.get(`${process.env.REACT_APP_COIN_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${timeRange}`);

        if (response.status !== 200 || !response.data.prices) {
            throw new Error("❌ API 数据无效");
        }

        if (response.data.prices.length === 0) {
            throw new Error("❌ API 没有返回任何数据");
        }

        const formattedData = {
            chartData: response.data.prices.map(([t, p]) => ({ time: t, price: parseFloat(p.toFixed(3)) })),
            marketCapData: response.data.market_caps.map(([t, m]) => ({ time: t, marketCap: parseFloat(m.toFixed(3)) })),
            volumeData: response.data.total_volumes.map(([t, v]) => ({ time: t, volume: parseFloat(v.toFixed(3)) })),
        };

        console.log("✅ Chart 数据:", formattedData);

        setChartData(formattedData.chartData);
        setMarketCapData(formattedData.marketCapData);
        setVolumeData(formattedData.volumeData);

        // **🚀 修正 `localStorage` 结构，确保 `timeRange` 数据存在**
        localStorage.setItem(globalCacheKey, JSON.stringify({
            ...cacheData,
            [timeRange]: { ...formattedData, timestamp: Date.now() }
        }));

    } catch (error) {
        console.error("❌ 获取图表数据失败:", error);
        setError("Failed to load chart data.");
    } finally {
        setLoading(false);
    }
};




const debouncedFetchChartData = _.debounce(fetchChartData, 5000); // 5 秒内最多请求 1 次





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
    if (!coinId) return;
    
    console.log("🔄 useEffect 触发，coinId:", coinId, "timeRange:", timeRange);
    fetchCoinInfo();
    fetchChartData();
  }, [coinId, timeRange]);



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
          backgroundColor: "#3b82f6", 
          color: "white", 
          padding: "10px 15px", 
          borderRadius: "5px", 
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          flexShrink: 0 /* ✅ 确保按钮不会被挤压 */
      }}
      >
        Back
      </button>

    {/* ⚠️ Warning Message */}
    <p style={{
        color: "#ffcc00",  /* ✅ 黄色提示 */
        fontSize: "16px",
        fontWeight: "bold",
        margin: 0,
        flexGrow: 1, /* ✅ 让文本占据剩余空间 */
        textAlign: "center", /* ✅ 居中 */
        whiteSpace: "nowrap" /* ✅ 防止换行 */
    }}>
        ⚠️ Due to API limitations, please avoid switching too frequently.
    </p>

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
            margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
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
            <YAxis
    tickFormatter={(value) => {
        if (value >= 1e6) return (value / 1e9).toFixed(2) + "B";
        if (value >= 1e6) return (value / 1e6).toFixed(2) + "M"; // 百万单位
        if (value >= 1e3) return (value / 1e3).toFixed(2) + "k"; // 千单位
        if (value > 0 && value < 0.0001) return (value * 1e6).toFixed(2) + "μ"; // μ单位
        return value.toFixed(3); // 正常显示 4 位小数
    }}
    domain={["dataMin", "dataMax"]}
    allowDataOverflow={true}
    tick={{ fill: "#ccc", fontSize: 14 }}
    axisLine={{ stroke: "#ccc" }}
    tickLine={false}
/>

<Tooltip
    formatter={(value) => {
        if (value > 1) return `$${value.toFixed(2)}`;
        if (value < 0.01) return `$${(value * 1e6).toFixed(2)}μ`;
        return `$${value.toFixed(6)}`;
    }}
    cursor={{ stroke: "rgba(255,255,255,0.3)", strokeWidth: 1 }}
    contentStyle={{
        backgroundColor: "#111",
        color: "#fff",
        border: "1px solid #fff",
        borderRadius: "5px",
        padding: "10px",
    }}
/>


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



  