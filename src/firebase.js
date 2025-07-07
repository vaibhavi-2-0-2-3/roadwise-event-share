// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyD7sSGsFNX5Z52u1Ad1oaDcKh6nrGB6AoE",
  authDomain: "live-tracking-529e5.firebaseapp.com",
  projectId: "live-tracking-529e5",
  storageBucket: "live-tracking-529e5.firebasestorage.app",
  messagingSenderId: "722220027678",
  appId: "1:722220027678:web:8b6b3d30be972a10d2830f",
  measurementId: "G-XFZ15M8VBR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
