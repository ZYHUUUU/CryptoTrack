import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getDocs, collection } from "firebase/firestore";
import { removeFromFavorites } from "./firebaseFunctions";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

function FavouriteList({ userId, onClose }) {
  const [favourites, setFavourites] = useState([]);
  const [coinList, setCoinList] = useState([]);
  const [coinDetails, setCoinDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userId = currentUser.uid;

          const favouritesRef = collection(db, "users", userId, "favorites");

          const snapshot = await getDocs(favouritesRef);

          const ids = snapshot.docs.map((doc) => doc.id);

          setFavourites(ids);
          setLoading(false);
        } else {
          console.error("No user is logged in.");
        }
      } catch (error) {
        console.error("Error fetching favourites:", error);
      }
    };

    fetchFavourites();
  }, []);

  useEffect(() => {
    const fetchCoinList = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/coins");
        if (!response.ok) {
          throw new Error(`Failed to fetch coins: ${response.status}`);
        }
        const data = await response.json();
        setCoinList(data);
      } catch (error) {
        console.error("Failed to fetch coin list:", error);
        alert("Unable to load coin data. Please try again later.");
      }
    };

    fetchCoinList();
  }, []);

  useEffect(() => {
    if (favourites.length > 0 && coinList.length > 0) {
      const details = favourites.map((coinId) => {
        const coin = coinList.find((c) => c.id === coinId);
        return {
          id: coinId,
          name: coin?.name || "Unknown Coin",
          logo: coin?.image || "",
        };
      });
      setCoinDetails(details);
      setLoading(false);
    }
  }, [favourites, coinList]);

  const handleRemove = async (coinId) => {
    try {
      await removeFromFavorites(coinId);
      setFavourites((prev) => prev.filter((id) => id !== coinId));
    } catch (error) {
      console.error("Failed to remove favourite:", error);
    }
  };

  if (loading) {
    return ReactDOM.createPortal(<p>Loading...</p>, document.body);
  }

  return ReactDOM.createPortal(
    <div className="favourite-list-overlay">
      <div className="favourite-list">
        <button onClick={onClose} className="close-button"></button>
        {coinDetails.length > 0 ? (
          <ul>
            {coinDetails.map((coin) => (
              <li key={coin.id} className="coin-item">
                <img src={coin.logo} alt={`${coin.name} logo`} className="coin-logo" />
                <span>{coin.name}</span>
                <button onClick={() => handleRemove(coin.id)} className="remove-button">
                  Remove from Favourites
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No favourites yet.</p>
        )}
      </div>
    </div>,
    document.body
  );
}

export default FavouriteList;
