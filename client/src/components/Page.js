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

  useEffect(() => {
    const fetchCoinInfo = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        const data = await response.json();
        setCoinInfo({
          name: data.name,
          symbol: data.symbol.toUpperCase(),
          image: data.image.large,
        });
      } catch (error) {
        console.error("Error fetching coin info:", error);
      }
    };

    const fetchChartData = async () => {
      const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`;
      const options = {
        method: "GET",
        headers: { accept: "application/json" },
      };

      setLoading(true);
      setError(false);

      try {
        const response = await fetch(`${url}?vs_currency=usd&days=${timeRange}`, options);
        const data = await response.json();
        if (!data.prices) throw new Error("No data available");

        setChartData(
          data.prices.map(([timestamp, price]) => ({
            time: timestamp,
            price: parseFloat(price.toFixed(3)),
          }))
        );

        setMarketCapData(
          data.market_caps.map(([timestamp, marketCap]) => ({
            time: timestamp,
            marketCap: parseFloat(marketCap.toFixed(3)),
          }))
        );

        setVolumeData(
          data.total_volumes.map(([timestamp, volume]) => ({
            time: timestamp,
            volume: parseFloat(volume.toFixed(3)),
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchCoinInfo();
    fetchChartData();
  }, [coinId, timeRange]);

  const formatXAxis = (time) => {
    const date = new Date(time);
    if (timeRange === "1") {
      return `${date.getHours()}:00`;
    } else if (timeRange === "7" || timeRange === "30") {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (timeRange === "365") {
      return date.toLocaleString("en", { month: "short" });
    }
    return time;
  };

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
    return (
      <div style={{ color: "red", textAlign: "center" }}>
        Failed to fetch chart data. Please try again.
      </div>
    );
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
