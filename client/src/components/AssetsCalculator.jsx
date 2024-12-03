import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AssetsCalculator = () => {
  const [coinList, setCoinList] = useState([]);
  const [rows, setRows] = useState([{ coin: "", quantity: "" }]);
  const [totalValue, setTotalValue] = useState(0);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    const fetchCoinList = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/coins");
        setCoinList(response.data);
      } catch (error) {
        console.error("Failed to fetch coin list:", error);
      }
    };
    fetchCoinList();
  }, []);

  const addRow = () => {
    if (rows.length >= 5) {
      alert("You can only add up to 5 coins.");
      return;
    }
    setRows([...rows, { coin: "", quantity: "" }]);
  };

  const deleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);

    if (field === "coin" && value.trim() !== "") {
      const matchedCoins = coinList.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCoins(matchedCoins);
    }
  };

  const selectCoin = (index, coin) => {
    const updatedRows = [...rows];
    updatedRows[index].coin = coin.id;
    setRows(updatedRows);
    setFilteredCoins([]);
  };

  useEffect(() => {
    const calculateTotal = async () => {
      const validRows = rows.filter((row) => row.coin && row.quantity);
      if (validRows.length === 0) {
        setTotalValue(0);
        return;
      }

      try {
        const ids = validRows.map((row) => row.coin).join(",");
        const response = await axios.get(
          `http://localhost:5001/prices/price?ids=${ids}&vs_currency=usd`
        );
        const total = validRows.reduce((sum, row) => {
          const price = response.data[row.coin]?.usd || 0;
          return sum + price * parseFloat(row.quantity);
        }, 0);
        setTotalValue(total);
      } catch (error) {
        console.error("Failed to calculate total value:", error);
      }
    };

    calculateTotal();
  }, [rows]);

  return (
    <div className="assets-calculator">
      <h2>Assets Calculator</h2>
      {rows.map((row, index) => (
        <div key={index} className="row">
          <input
            type="text"
            placeholder="Enter coin name"
            value={row.coin}
            onChange={(e) => updateRow(index, "coin", e.target.value)}
          />
          {filteredCoins.length > 0 && (
            <ul
              ref={(el) => (dropdownRefs.current[index] = el)}
              className="dropdown-menu"
            >
              {filteredCoins.map((coin) => (
                <li key={coin.id} onClick={() => selectCoin(index, coin)}>
                  <img src={coin.image} alt={coin.name} className="coin-logo" />
                  {coin.name} ({coin.symbol.toUpperCase()})
                </li>
              ))}
            </ul>
          )}
          <input
            type="number"
            placeholder="Enter quantity"
            value={row.quantity}
            onChange={(e) => updateRow(index, "quantity", e.target.value)}
          />
          <button onClick={() => deleteRow(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addRow}>Add</button>
      <h3>Total: ${totalValue.toFixed(2)}</h3>
    </div>
  );
};

export default AssetsCalculator;
