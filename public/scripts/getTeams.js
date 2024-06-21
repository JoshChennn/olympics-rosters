document.addEventListener("DOMContentLoaded", function() {
  const teamForm = document.getElementById('teamForm');
  const teamsContainer = document.getElementById('teamsContainer');

  teamForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const sport = document.getElementById('sport').value;
    const country = document.getElementById('country').value || 'usa';

    try {
      const response = await fetch(`https://us-central1-olympics-c5b48.cloudfunctions.net/api/getTeams?sport=${sport}&country=${country}`);
      const teams = await response.json();

      displayTeams(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  });

  function displayTeams(teams) {
    teamsContainer.innerHTML = '';
    if (teams.length === 0) {
      teamsContainer.innerHTML = '<p>No teams found.</p>';
      return;
    }

    const ul = document.createElement('ul');
    teams.forEach(team => {
      const li = document.createElement('li');
      li.textContent = `Team ID: ${team.id}, Data: ${JSON.stringify(team.data)}`;
      ul.appendChild(li);
    });

    teamsContainer.appendChild(ul);
  }
});
