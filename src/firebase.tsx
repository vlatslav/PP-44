// /src/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByrC8ynKhaPldfx-LdTzTgTwTXHcreX_Y",
  authDomain: "moviemosaic.firebaseapp.com",
  projectId: "moviemosaic",
  storageBucket: "moviemosaic.firebasestorage.app",
  messagingSenderId: "694658113725",
  appId: "1:694658113725:web:47fe2f9e4e04c124de97d4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
