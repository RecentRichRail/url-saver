document.addEventListener('DOMContentLoaded', () => {
  // Initial data fetch
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'initial_data' })
  })
  .then(response => response.json())
  .then(data => {
    populateForm('playerForm', data.players);
    populateForm('gameModeForm', data.gameModes);
    populateForm('gameFunctionForm', data.gameFunctions);
    updatePickedItems(data.pickedItems);
    populatePlayerList(data.players);
  });

  // Event listeners
  document.getElementById('viewAddPlayerForm').addEventListener('submit', event => {
    event.preventDefault();
    const playerName = document.getElementById('viewNewPlayerName').value;
    addPlayer(playerName);
  });

  document.getElementById('addPlayerForm').addEventListener('submit', event => {
    event.preventDefault();
    const playerName = document.getElementById('newPlayerName').value;
    addPlayer(playerName);
  });

  document.getElementById('editToggleBtn').addEventListener('click', () => {
    toggleEditMode();
  });

  document.getElementById('doneEditBtn').addEventListener('click', () => {
    toggleEditMode();
  });

  document.getElementById('teamCheckbox').addEventListener('change', function() {
    document.getElementById('teamCount').style.display = this.checked ? 'inline' : 'none';
  });

  document.getElementById('pickPlayerBtn').addEventListener('click', () => handlePick('player'));
  document.getElementById('createTeamsBtn').addEventListener('click', handleCreateTeams);
  document.getElementById('pickGameModeBtn').addEventListener('click', () => handlePick('gameMode'));
  document.getElementById('pickGameFunctionBtn').addEventListener('click', () => handlePick('gameFunction'));

  document.getElementById('resetPlayerBtn').addEventListener('click', () => handleReset('player'));
  document.getElementById('resetGameModeBtn').addEventListener('click', () => handleReset('gameMode'));
  document.getElementById('resetGameFunctionBtn').addEventListener('click', () => handleReset('gameFunction'));
});

// Function to add a player and update the list
function addPlayer(name) {
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add_player', name: name })
  })
  .then(response => response.json())
  .then(response => {
    if (response.status === 'success') {
      fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initial_data' })
      })
      .then(response => response.json())
      .then(data => {
        populateForm('playerForm', data.players);
        populatePlayerList(data.players);
        document.getElementById('viewNewPlayerName').value = '';
        document.getElementById('newPlayerName').value = '';
      });
    } else {
      alert(response.message);
    }
  });
}

// Function to toggle between edit and view modes
function toggleEditMode() {
  const editMode = document.getElementById('editMode');
  const viewMode = document.getElementById('viewMode');
  const isEditing = editMode.style.display === 'block';

  if (isEditing) {
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
    document.getElementById('editToggleBtn').innerText = 'Edit Players';
  } else {
    editMode.style.display = 'block';
    viewMode.style.display = 'none';
    document.getElementById('editToggleBtn').innerText = 'View Mode';
    fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'initial_data' })
    })
    .then(response => response.json())
    .then(data => {
      populatePlayerList(data.players);
    });
  }
}

// Function to populate a form with items
function populateForm(formId, items) {
  const form = document.getElementById(formId);
  form.innerHTML = items.map(item => `
    <label>
      <input type="checkbox" value="${item}"> ${item}
    </label><br>
  `).join('');
}

// Function to update displayed picked items
function updatePickedItems(pickedItems) {
  document.getElementById('pickedPlayer').innerText = pickedItems.player || '';
  document.getElementById('pickedGameMode').innerText = pickedItems.gameMode || '';
  document.getElementById('pickedGameFunction').innerText = pickedItems.gameFunction || '';
}

// Function to populate the player list in edit mode
function populatePlayerList(players) {
  const playerListItems = document.getElementById('playerListItems');
  playerListItems.innerHTML = players.map(player => `
    <li>
      ${player}
      <button onclick="removePlayer('${player}')">Remove</button>
    </li>
  `).join('');
}

// Function to remove a player and update the list
function removePlayer(playerName) {
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'remove_player', name: playerName })
  })
  .then(response => response.json())
  .then(response => {
    if (response.status === 'success') {
      fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initial_data' })
      })
      .then(response => response.json())
      .then(data => {
        populatePlayerList(data.players);
      });
    } else {
      alert(response.message);
    }
  });
}

// Function to handle picking items
function handlePick(type) {
  const selectedItems = Array.from(document.querySelectorAll(`#${type}Form input:checked`)).map(input => input.value);
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pick_item', type: type, selectedItems: selectedItems })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById(`picked${capitalize(type)}`).innerText = `The picked ${type} is: ${data.pickedItem}`;
  });
}

// Function to handle team creation
function handleCreateTeams() {
  const selectedPlayers = Array.from(document.querySelectorAll('#playerForm input:checked')).map(input => input.value);
  const teamCount = parseInt(document.getElementById('teamCount').value);
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_teams', players: selectedPlayers, teamCount: teamCount })
  })
  .then(response => response.json())
  .then(data => displayTeams(data.teams));
}

// Function to handle resetting picked items
function handleReset(type) {
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset_picked_items', type: type })
  })
  .then(response => response.json())
  .then(() => {
    document.getElementById(`picked${capitalize(type)}`).innerText = '';
  });
}

// Function to display the created teams
function displayTeams(teams) {
  const teamsContainer = document.getElementById('teamsContainer');
  teamsContainer.innerHTML = teams.map((team, index) => `
    <div>
      <h3>Team ${index + 1}</h3>
      <p>${team.join(', ')}</p>
    </div>
  `).join('');
}

// Function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
