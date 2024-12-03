import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCu0L4Yt1c7WQFIFt-7_rD8KUzp_EbxHb8",
  authDomain: "cryptotracker-d849d.firebaseapp.com",
  projectId: "cryptotracker-d849d",
  storageBucket: "cryptotracker-d849d.appspot.com",
  messagingSenderId: "113486458323",
  appId: "1:113486458323:web:1d2d5fea3f3fb585401326",
  measurementId: "G-YKJW1FRX4W",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db, analytics };