const express = require('express');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6WBb87ng8iqq4tiqRujhSmK1tpozfrCc",
  authDomain: "olympics-c5b48.firebaseapp.com",
  projectId: "olympics-c5b48",
  storageBucket: "olympics-c5b48.appspot.com",
  messagingSenderId: "202029431723",
  appId: "1:202029431723:web:e68aaf9b7b8458015cf0ee",
  measurementId: "G-Y0FYXEC525"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Express
const server = express();

// Serve static files from the "public" directory
server.use(express.static(path.join(__dirname, '../public')));

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { db };
