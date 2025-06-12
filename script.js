document.addEventListener('DOMContentLoaded', () => {
  // Toggle between Sign In and Register
  const switchToRegister = document.getElementById("switch-to-register");
  const switchToSignin = document.getElementById("switch-to-signin");
  const logoutBtn = document.querySelector(".logout-btn");
  const signinForm = document.getElementById("signin");

  if (switchToRegister) {
    switchToRegister.addEventListener("click", function () {
      document.getElementById("signin").classList.remove("active");
      document.getElementById("register").classList.add("active");
    });
  }

  if (switchToSignin) {
    switchToSignin.addEventListener("click", function () {
      document.getElementById("register").classList.remove("active");
      document.getElementById("signin").classList.add("active");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      alert("Logged out!");
      // window.location.href = "login.html";
    });
  }

  if (!signinForm) {
    console.error("❌ Sign-in form not found in the DOM.");
    return;
  }

// Sign-in form submit handler
signinForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('signin-username').value;
  const password = document.getElementById('signin-password').value;

  fetch('http://localhost:8080/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    })
    .then((data) => {
      // Store the admin_id locally
      localStorage.setItem('admin_id', data.admin_id);

      // Optionally also store username if needed
      localStorage.setItem('username', username);

      // Redirect to dashboard
      window.location.href = 'main.html';
    })
    .catch((err) => {
      alert('Login failed: ' + err.message);
    });
});


// Register form submit handler
document.getElementById("register").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission

  const name = document.getElementById("name").value;
  const email = document.getElementById("register-email").value;
  const position = document.getElementById("register-position").value;
  const age = document.getElementById("register-age").value;
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Simple password confirmation check
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const data = {
    full_name: name,
    position,
    age: age,
    email,
    username,
    password
  };

  try {
    const response = await fetch("http://localhost:8080/registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }

    const result = await response.json();
    alert("Registration successful!");
    console.log(result);

    // Optional: Redirect or reset form
    window.location.href = "/index.html";
    document.getElementById("register").reset();


  } catch (error) {
    console.error("Error:", error.message);
    alert("Registration failed. Please try again.");
  }
});
}
);
