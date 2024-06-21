const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://olympics-c5b48.firebaseio.com' // Ensure this is the correct URL
});

const db = admin.firestore();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// Fetch teams data
const fetchTeamsData = async (sport, country = 'usa') => {
  const teamsRef = db.collection('countries').doc(country).collection('teams').doc(sport).collection('people');

  try {
    const snapshot = await teamsRef.get();
    if (snapshot.empty) {
      console.log(`No matching documents for sport: ${sport} in country: ${country}.`);
      return [];
    }

    let teams = [];
    snapshot.forEach(doc => {
      teams.push({ id: doc.id, data: doc.data() });
    });

    return teams;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

// Fetch all athletes' document IDs and names
const fetchAllAthletes = async (country = 'usa') => {
  const teamsRef = db.collection('countries').doc(country).collection('teams');
  
  try {
    const teamsSnapshot = await teamsRef.get();
    if (teamsSnapshot.empty) {
      console.log(`No teams found in country: ${country}.`);
      return [];
    }

    let athletes = [];
    for (const teamDoc of teamsSnapshot.docs) {
      const peopleRef = teamDoc.ref.collection('people');
      const peopleSnapshot = await peopleRef.get();
      
      peopleSnapshot.forEach(personDoc => {
        const data = personDoc.data();
        athletes.push({ id: personDoc.id, name: data.name });
      });
    }

    return athletes;
  } catch (error) {
    console.error('Error getting athletes: ', error);
    throw error;
  }
};

// Define /getTeams endpoint
app.get('/getTeams', async (req, res) => {
  const { sport, country } = req.query;

  try {
    const teams = await fetchTeamsData(sport, country);
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).send('Error fetching teams data');
  }
});

// Define /getAllAthletes endpoint
app.get('/getAllAthletes', async (req, res) => {
  const { country } = req.query;

  try {
    const athletes = await fetchAllAthletes(country);
    res.status(200).json(athletes);
  } catch (error) {
    res.status(500).send('Error fetching athletes data');
  }
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
