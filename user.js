document.addEventListener('DOMContentLoaded', () => {
  const userTableBody = document.querySelector('#users-section tbody');
  const userForm = document.querySelector('form');

  // 🔄 1. Fetch and display users
  async function loadUsers() {
    try {
      const response = await fetch('http://localhost:8080/get_users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const users = await response.json();

      userTableBody.innerHTML = ''; // Clear table

      users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.className = `border-b hover:bg-cyan-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`;
        row.innerHTML = `
          <td class="py-3 px-4">${user.user_id}</td>
          <td class="py-3 px-4">${user.name}</td>
          <td class="py-3 px-4">${user.email}</td>
          <td class="py-3 px-4">${user.phone}</td>
        `;
        userTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading users:', err);
      userTableBody.innerHTML = '<tr><td colspan="4" class="py-4 px-4 text-center text-red-500">Failed to load users</td></tr>';
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
