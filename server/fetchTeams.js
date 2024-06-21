const { getFirestore, collection, getDocs } = require('firebase-admin/firestore');
const { db } = require('./app');

const fetchTeamsData = async (sport, country = 'usa') => {
  const teamsRef = collection(db, 'countries', country, 'teams', sport);
  
  try {
    const snapshot = await getDocs(teamsRef);
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

module.exports = { fetchTeamsData };
