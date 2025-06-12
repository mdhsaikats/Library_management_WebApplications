document.getElementById('userSearchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const phone = document.getElementById('phone').value.trim();
  const msg = document.getElementById('userSearchMsg');
  msg.textContent = "Checking...";

  try {
    const res = await fetch('http://localhost:8080/check-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    if (data.exists) {
      window.location.href = `borrow_action.html?user=${encodeURIComponent(phone)}`;
    } else {
      msg.textContent = "User not found!";
    }
  } catch (err) {
    msg.textContent = "Error checking user.";
  }
});
