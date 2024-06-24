const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://olympics-c5b48.firebaseio.com'
});

const db = admin.firestore();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fetch all teams data
const fetchAllTeamsData = async (country = 'usa') => {
  const teamsRef = db.collection('countries').doc(country).collection('teams');

  try {
    const snapshot = await teamsRef.get();
    if (snapshot.empty) {
      console.log(`No teams found in country: ${country}.`);
      return [];
    }

    let teams = [];
    snapshot.forEach(doc => {
      teams.push({ id: doc.id, data: doc.data() });
    });

    return teams;
  } catch (error) {
    console.error('Error getting teams: ', error);
    throw error;
  }
};

// Fetch athletes data for a specific sport
const fetchAthletesData = async (sport, country = 'usa') => {
  const peopleRef = db.collection('countries').doc(country).collection('teams').doc(sport).collection('people');

  try {
    const snapshot = await peopleRef.get();
    if (snapshot.empty) {
      console.log(`No athletes found for sport: ${sport} in country: ${country}.`);
      return [];
    }

    let athletes = [];
    snapshot.forEach(doc => {
      athletes.push({ id: doc.id, data: doc.data() });
    });

    return athletes;
  } catch (error) {
    console.error('Error getting athletes: ', error);
    throw error;
  }
};

// Update profile_image and header_image fields for each athlete
const updateAthleteImages = async (country = 'usa') => {
  const teamsRef = db.collection('countries').doc(country).collection('teams');

  try {
    const teamsSnapshot = await teamsRef.get();
    if (teamsSnapshot.empty) {
      console.log(`No teams found in country: ${country}.`);
      return;
    }

    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      console.log(`Processing team: ${teamId}`);
      const peopleRef = teamDoc.ref.collection('people');
      const peopleSnapshot = await peopleRef.get();

      for (const personDoc of peopleSnapshot.docs) {
        const athleteData = personDoc.data();
        const athleteId = personDoc.id;
        const profileImageUrl = `gs://olympics-c5b48.appspot.com/${country}/${teamId}/${athleteData.name.replace(/ /g, '_')}_profile.png`;
        const headerImageUrl = `gs://olympics-c5b48.appspot.com/${country}/${teamId}/${athleteData.name.replace(/ /g, '_')}_header.png`;

        try {
          console.log(`Updating athlete: ${athleteId} with profile image: ${profileImageUrl} and header image: ${headerImageUrl}`);
          await personDoc.ref.update({
            profile_image: profileImageUrl,
            header_image: headerImageUrl
          });
          console.log(`Updated images for athlete ${athleteId} in team ${teamId}`);
        } catch (updateError) {
          console.error(`Error updating images for athlete ${athleteId} in team ${teamId}: `, updateError);
        }
      }
    }
  } catch (error) {
    console.error('Error updating athlete images: ', error);
    throw error;
  }
};

// Generate description using OpenAI API
app.post('/generateDescription', async (req, res) => {
  const { name, sport } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: "system", content: `Generate a terse 3-5 sentence description for the ${sport} athlete ${name}. Include necessary information including age, height and weight, playing history, previous Olympic experience (if none do not mention), and personal life.` }],
    });

    const description = response.choices[0].message.content.trim();
    res.status(200).json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).send('Error generating description');
  }
});

// Update athlete description in Firebase
app.post('/updateDescription', async (req, res) => {
  const { athleteId, sportId, description } = req.body;

  try {
    await db.collection('countries').doc('usa').collection('teams').doc(sportId).collection('people').doc(athleteId).update({ description });
    res.status(200).send('Description updated successfully');
  } catch (error) {
    console.error('Error updating description:', error);
    res.status(500).send('Error updating description');
  }
});

// Define /updateAthleteImages endpoint
app.get('/updateAthleteImages', async (req, res) => {
  const { country } = req.query;

  try {
    await updateAthleteImages(country);
    res.status(200).send('Athlete images updated successfully');
  } catch (error) {
    console.error('Error in /updateAthleteImages endpoint: ', error);
    res.status(500).send('Error updating athlete images');
  }
});

// Define /getTeams endpoint
app.get('/getTeams', async (req, res) => {
  const { country } = req.query;

  try {
    const teams = await fetchAllTeamsData(country);
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).send('Error fetching teams data');
  }
});

// Define /getAthletes endpoint
app.get('/getAthletes', async (req, res) => {
  const { sport, country } = req.query;

  try {
    const athletes = await fetchAthletesData(sport, country);
    res.status(200).json(athletes);
  } catch (error) {
    res.status(500).send('Error fetching athletes data');
  }
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
