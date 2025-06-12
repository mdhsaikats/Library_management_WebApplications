document.addEventListener("DOMContentLoaded", () => {
  const adminId = localStorage.getItem('admin_id');
  if (!adminId) {
    alert("No admin logged in.");
    return;
  }

  fetch(`http://localhost:8080/get_admin?admin_id=${encodeURIComponent(adminId)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch admin profile");
      }
      return response.json();
    })
    .then(data => {
      document.querySelector('.detail-name').innerHTML = `<strong>Name:</strong> ${data.full_name}`;
      document.querySelector('.detail-position').innerHTML = `<strong>Position:</strong> ${data.position}`;
      document.querySelector('.detail-age').innerHTML = `<strong>Age:</strong> ${data.age}`;
      document.querySelector('.detail-email').innerHTML = `<strong>Email:</strong> ${data.email}`;
      document.querySelector('.detail-username').innerHTML = `<strong>Username:</strong> ${data.username}`;
    })
    .catch(error => {
      console.error("Error loading profile:", error);
    });
});
