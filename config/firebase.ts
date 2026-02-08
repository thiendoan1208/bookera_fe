// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0JAfRGMn74OEKExUhyVoMPbbCjS1aVnI",
  authDomain: "bookera-a3bea.firebaseapp.com",
  projectId: "bookera-a3bea",
  storageBucket: "bookera-a3bea.firebasestorage.app",
  messagingSenderId: "487507601640",
  appId: "1:487507601640:web:d5cfa780aa95873911815d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
