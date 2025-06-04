// script.js

document.getElementById("switch-to-register").addEventListener("click", function () {
  document.getElementById("signin").classList.remove("active");
  document.getElementById("register").classList.add("active");
});

document.getElementById("switch-to-signin").addEventListener("click", function () {
  document.getElementById("register").classList.remove("active");
  document.getElementById("signin").classList.add("active");
});

document.querySelector(".logout-btn").addEventListener("click", function () {
  // Clear session, redirect, etc.
  alert("Logged out!");
  // window.location.href = "login.html"; // Optional redirect
});
