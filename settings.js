document.addEventListener('DOMContentLoaded', function() {
  // Delete User Form
  const userDeletionForm = document.getElementById('userDeletionForm');
  userDeletionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('deleteUserPhone').value.trim();
    if (!phone) {
      alert('Please enter a phone number');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/delete_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });

      if (response.ok) {
        const result = await response.json();
        alert('User deleted successfully!');
        userDeletionForm.reset();
      } else {
        const error = await response.text();
        alert('Error deleting user: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    }
  });

  // Update User Form
  const userUpdateForm = document.getElementById('userUpdateForm');
  userUpdateForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('updateUserPhone').value.trim();
    const name = document.getElementById('updateUserName').value.trim();
    const email = document.getElementById('updateUserEmail').value.trim();

    if (!phone || !name || !email) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/update_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          name,
          email
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('User updated successfully!');
        userUpdateForm.reset();
      } else {
        const error = await response.text();
        alert('Error updating user: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    }
  });

  // Delete Book Form
  const bookDeletionForm = document.getElementById('bookDeletionForm');
  bookDeletionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const isbn = document.getElementById('deleteBookISBN').value.trim();
    if (!isbn) {
      alert('Please enter an ISBN number');
      return;
    }

    if (!confirm('Are you sure you want to delete this book? This will also delete all its copies. This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/delete_book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isbn })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Book deleted successfully!');
        bookDeletionForm.reset();
      } else {
        const error = await response.text();
        alert('Error deleting book: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    }
  });

  // Admin Update Form
  const adminUpdateForm = document.getElementById('adminUpdateForm');
  adminUpdateForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const confirmPassword = document.getElementById('adminConfirmPassword').value.trim();

    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      alert('Password must be at least 4 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/update_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Admin updated successfully!');
        adminUpdateForm.reset();
      } else {
        const error = await response.text();
        alert('Error updating admin: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    }
  });
});
