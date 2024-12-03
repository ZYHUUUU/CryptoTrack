import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function FavouriteButton({ coinId }) {
  const [isFavourite, setIsFavourite] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!coinId) {
      console.error("coinId is undefined or null");
      return;
    }
    checkIfFavourite();
  }, [coinId, user]);

  const checkIfFavourite = async () => {
    if (user) {
      const favouriteRef = doc(db, "users", user.uid, "favorites", coinId);
      const docSnap = await getDoc(favouriteRef);

      if (docSnap.exists()) {
        setIsFavourite(true);
      } else {
        setIsFavourite(false);
      }
    }
  };

  const toggleFavourite = async () => {
    if (!user) {
      alert("Please log in to add to favourites.");
      return;
    }

    const favouriteRef = doc(db, "users", user.uid, "favorites", coinId);

    if (isFavourite) {
      alert("This coin is already in your favourites.");
    } else {
      await setDoc(favouriteRef, { coinId }, { merge: true });
      setIsFavourite(true);
      alert("Coin added to your favourites!");
    }
  };

  useEffect(() => {
    checkIfFavourite();
  }, [user, coinId]);

  return (
    <button onClick={toggleFavourite} className="favourite-button">
      {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
    </button>
  );
}

export default FavouriteButton;
