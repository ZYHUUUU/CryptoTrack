import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';


const SearchPage = () => {
  const [coin, setCoin] = useState("");
  const [coinList, setCoinList] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCoinList = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/coins`);
        setCoinList(response.data); // ✅ 直接使用 response.data
      } catch (error) {
        console.error("Failed to fetch coin list:", error);
        alert("Unable to load coin data. Please try again later.");
      }
    };
  
    fetchCoinList(); // ✅ 调用函数
  }, []);
  

  useEffect(() => {
    setCoin("");
    setFilteredCoins([]);
    setShowDropdown(false);
  }, [location.pathname]);

  const handleInputChange = (value) => {
    setCoin(value);

    if (value.trim() === "") {
      setFilteredCoins([]);
      setShowDropdown(false);
      return;
    }

    const matchedCoins = coinList.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCoins(matchedCoins);
    setShowDropdown(true);
  };

  const handleOptionClick = (selectedCoin) => {
    setCoin(selectedCoin.name);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (!coin.trim()) {
      alert("Please enter a coin name!");
      return;
    }

    const selectedCoin = coinList.find(
      (item) => item.name.toLowerCase() === coin.toLowerCase()
    );

    if (!selectedCoin) {
      alert("No matching coin found!");
      return;
    }

    navigate(`/coin/${selectedCoin.id}`);
  };

  return (
    <div
      style={{
        padding: "20px",
        marginTop: "-50px",
        marginBottom: "30px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Coin Historical Data Search</h1>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
        }}
        ref={dropdownRef}
      >
        <input
          type="text"
          value={coin}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter a coin name, e.g., Bitcoin"
          style={{
            flex: "1",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px 0 0 5px",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            border: "1px solid #ccc",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "0 5px 5px 0",
            cursor: "pointer",
          }}
        >
          Search
        </button>
        {showDropdown && (
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              marginTop: "10px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "white",
              position: "absolute",
              zIndex: 9999,
              width: dropdownRef.current?.offsetWidth || "200px",
              left: 0,
              top: dropdownRef.current?.offsetHeight + 10 || 0,
              color: "black",
            }}
          >
            {filteredCoins.length > 0 ? (
              filteredCoins.slice(0, 10).map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => handleOptionClick(item)}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#003366")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }}
                  />
                  {item.name}
                </li>
              ))
            ) : (
              <li
                style={{
                  padding: "10px",
                  color: "black",
                  textAlign: "center",
                  cursor: "default",
                  backgroundColor: "white",
                  borderBottom: "1px solid #eee",
                }}
              >
                No match
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
