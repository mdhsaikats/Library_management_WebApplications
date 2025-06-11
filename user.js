document.addEventListener('DOMContentLoaded', () => {
  const userTableBody = document.querySelector('.user-table tbody');
  const userForm = document.querySelector('.user-form');

  // 🔄 1. Fetch and display users
  async function loadUsers() {
    try {
      const response = await fetch('http://localhost:8080/get_users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();

      userTableBody.innerHTML = ''; // Clear table

      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.user_id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
        `;
        userTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading users:', err);
      userTableBody.innerHTML = '<tr><td colspan="4">Failed to load users</td></tr>';
    }
  }

  // 🔄 2. Add new user
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullName || !email || !phone ) {
      alert("Please fill in all fields.");
      return;
    }

    const newUser = {
      name: fullName,
      email,
      phone,
    };

    try {
      const response = await fetch('http://localhost:8080/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert('Member added successfully!');
      userForm.reset();
      await loadUsers();

    } catch (err) {
      console.error('Error adding member:', err);
      alert('Failed to add member. ' + err.message);
    }
  });

  // Initial user list load
  loadUsers();
});
