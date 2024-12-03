import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

export async function removeFromFavorites(coinId) {
  const userId = auth.currentUser.uid; 
  const docRef = doc(db, "users", userId, "favorites", coinId);

  try {
    await deleteDoc(docRef);
    console.log(`Successfully removed favorite: ${coinId}`);
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}
