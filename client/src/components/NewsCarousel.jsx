import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from 'axios';

const NEWS_CACHE_KEY = "news_cache";  // 本地存储 Key
const CACHE_EXPIRY = 10 * 60 * 1000; // 缓存 10 分钟（单位：毫秒）

const NewsBoard = () => {
    const [news, setNews] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [articlesPerPage, setArticlesPerPage] = useState(5); // 默认 PC 端 5 条
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(false);
    const intervalRef = useRef(null);

    // 监听屏幕宽度，动态调整每页新闻数量
    useEffect(() => {
        const updateArticlesPerPage = () => {
            if (window.innerWidth <= 768) {
                setArticlesPerPage(2); // 移动端每页 2 条
            } else {
                setArticlesPerPage(5); // PC 端每页 5 条
            }
        };

        window.addEventListener("resize", updateArticlesPerPage);
        updateArticlesPerPage(); // 初始化时调用

        return () => {
            window.removeEventListener("resize", updateArticlesPerPage);
        };
    }, []);

    // 读取本地缓存
    const loadFromCache = () => {
        const cachedData = localStorage.getItem(NEWS_CACHE_KEY);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                console.log("📦 加载缓存新闻数据...");
                return data;
            }
        }
        return null;
    };

    // 获取新闻数据
    const fetchNews = async () => {
        try {
            console.log("🌐 正在请求新闻 API...");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/news`);
            if (Array.isArray(response.data)) {
                setNews(response.data);
                localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ data: response.data, timestamp: Date.now() }));
            } else {
                console.error("❌ API 返回的数据格式错误:", response.data);
                setNews([]);
            }
        } catch (error) {
            console.error("❌ 请求失败，使用缓存:", error);
            setNews(loadFromCache() || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cachedNews = loadFromCache();
        if (cachedNews) {
            setNews(cachedNews);
            setLoading(false);
        } else {
            fetchNews();
        }
    }, []);

    // 定期自动刷新数据
    useEffect(() => {
        const interval = setInterval(fetchNews, CACHE_EXPIRY);
        return () => clearInterval(interval);
    }, []);

    // 自动滚动
    const totalPages = Math.ceil(news.length / articlesPerPage);

    const startAutoSlide = useCallback(() => {
        intervalRef.current = setInterval(() => {
            setCurrentPage((prevPage) => (prevPage === totalPages - 1 ? 0 : prevPage + 1));
        }, 5000);
    }, [totalPages]);

    const stopAutoSlide = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, [startAutoSlide]);

    const goToPage = (pageIndex) => {
        stopAutoSlide();
        setCurrentPage(pageIndex);
        startAutoSlide();
    };

    const goToPreviousPage = () => {
        goToPage(currentPage === 0 ? totalPages - 1 : currentPage - 1);
    };

    const goToNextPage = () => {
        goToPage((currentPage + 1) % totalPages);
    };

    const currentNews = news.slice(currentPage * articlesPerPage, currentPage * articlesPerPage + articlesPerPage);

    return (
        <div
            style={{
                width: "80%",
                margin: "auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                position: "relative",
                overflow: "hidden",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {loading ? (
                <p style={{ color: "white" }}>Loading...</p>
            ) : currentNews.length > 0 ? (
                currentNews.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            borderBottom: "1px solid #e0e0e0",
                            paddingBottom: "0.5rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.9rem",
                                color: "white",
                                margin: 0,
                            }}
                        >
                            <span style={{ fontWeight: "bold", color: "white" }}>{item.source}</span> · {new Date(item.published).toLocaleString()}
                        </p>
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: "1rem",
                                textDecoration: "none",
                                color: "white",
                                display: "block",
                                marginTop: "0.5rem",
                            }}
                        >
                            {item.title}
                        </a>
                    </div>
                ))
            ) : (
                <p style={{ color: "white" }}>No news available.</p>
            )}

            {/* 左右翻页按钮 */}
            {hovered && (
                <>
                    <button onClick={goToPreviousPage} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>‹</button>
                    <button onClick={goToNextPage} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>›</button>
                </>
            )}

            {/* 分页指示器（小圆点） */}
            {totalPages > 1 && (
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <span key={index} onClick={() => goToPage(index)} style={{ display: "inline-block", width: "10px", height: "10px", margin: "0 5px", borderRadius: "50%", backgroundColor: index === currentPage ? "#007bff" : "#ccc", cursor: "pointer", transition: "background-color 0.3s" }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsBoard;
