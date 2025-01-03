import React, { useEffect, useState, useRef, useCallback } from "react";

const NewsBoard = () => {
    const [news, setNews] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hovered, setHovered] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/news");
                const data = await response.json();
                if (Array.isArray(data)) {
                    setNews(data);
                } else {
                    setNews([]);
                }
            } catch (error) {
                setNews([]);
            }
        };

        fetchNews();
    }, []);

    const totalPages = Math.ceil(news.length / 5);

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

    const currentNews = news.slice(currentPage * 5, currentPage * 5 + 5);

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
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1rem",
                }}
            >
                <h2 style={{ marginRight: "0.5rem" }}>Top News</h2>
                <img
                    src="/default-crypto-news.jpg"
                    alt="Top News Icon"
                    style={{ width: "24px", height: "24px" }}
                />
            </div>
            <div>
                {currentNews.map((item, index) => (
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
                ))}
            </div>
            {hovered && (
                <button
                    onClick={goToPreviousPage}
                    style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(0, 0, 0, 0.5)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                    }}
                >
                    ‹
                </button>
            )}
            {hovered && (
                <button
                    onClick={goToNextPage}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(0, 0, 0, 0.5)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                    }}
                >
                    ›
                </button>
            )}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                {Array.from({ length: totalPages }).map((_, index) => (
                    <span
                        key={index}
                        onClick={() => goToPage(index)}
                        style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            margin: "0 5px",
                            borderRadius: "50%",
                            backgroundColor: index === currentPage ? "#007bff" : "#ccc",
                            cursor: "pointer",
                            transition: "background-color 0.3s",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default NewsBoard;
