document.addEventListener('DOMContentLoaded', () => {
  // Fetch initial data when the page loads
  fetchDataAndPopulate(false);

  // Event listeners
  document.getElementById('viewAddLinkForm').addEventListener('submit', event => {
    event.preventDefault();
    const linkUrl = document.getElementById('viewNewLinkUrl').value;
    addLink(linkUrl);
  });

  document.getElementById('addLinkForm').addEventListener('submit', event => {
    event.preventDefault();
    const linkUrl = document.getElementById('newLinkUrl').value;
    addLink(linkUrl);
  });

  document.getElementById('editToggleBtn').addEventListener('click', () => {
    toggleEditMode();
  });
});

// Function to add a link and update the list
function addLink(url) {
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add_url', url: url })
  })
  .then(response => response.json())
  .then(response => {
    if (response.status === 'success') {
      // Fetch data again and update the list
      fetchDataAndPopulate(document.getElementById('editMode').style.display === 'block');
      document.getElementById('viewNewLinkUrl').value = '';
      document.getElementById('newLinkUrl').value = '';
    } else {
      alert(response.message);
    }
  })
  .catch(error => console.error('Error:', error));
}

// Function to remove a link and update the list
function removeLink(url) {
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'remove_url', url: url })
  })
  .then(response => response.json())
  .then(response => {
    if (response.status === 'success') {
      // Fetch data again and update the list
      fetchDataAndPopulate(document.getElementById('editMode').style.display === 'block');
    } else {
      alert(response.message);
    }
  })
  .catch(error => console.error('Error:', error));
}

// Function to fetch data and populate the link list
function fetchDataAndPopulate(showRemoveButtons) {
  fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'initial_data' })
  })
  .then(response => response.json())
  .then(data => {
    populateLinkList(data.urls, showRemoveButtons);
  });
}

// Function to populate the link list
function populateLinkList(urls, showRemoveButtons) {
  const linkListItems = document.getElementById('linkListItems');
  linkListItems.innerHTML = urls.map(url => `
    <li>
      <a href="${url}" target="_blank">${url}</a>
      ${showRemoveButtons ? `<button class="remove-btn" onclick="removeLink('${url}')">Remove</button>` : ''}
    </li>
  `).join('');
}

// Function to toggle between edit and view modes
function toggleEditMode() {
  const editMode = document.getElementById('editMode');
  const viewMode = document.getElementById('viewMode');
  const editToggleBtn = document.getElementById('editToggleBtn');

  const isEditing = editMode.style.display === 'block';

  if (isEditing) {
    // Switch to view mode
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
    editToggleBtn.innerText = 'Edit Links';

    // Fetch and update data for view mode (no remove buttons)
    fetchDataAndPopulate(false);
  } else {
    // Switch to edit mode
    editMode.style.display = 'block';
    viewMode.style.display = 'none';
    editToggleBtn.innerText = 'View Mode';

    // Fetch and update data for edit mode (with remove buttons)
    fetchDataAndPopulate(true);
  }
}
