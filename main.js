async function loadDashboard() {
  try {
    const response = await fetch("http://localhost:8080/dashboard");
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    const data = await response.json();

    document.getElementById("totalBooks").textContent = data.total_books;
    document.getElementById("members").textContent = data.members;
    document.getElementById("borrowedToday").textContent = data.borrowed_today;
    document.getElementById("returned").textContent = data.returned;
  } catch (error) {
    console.error("Dashboard load error:", error);
    document.getElementById("totalBooks").textContent = "Error";
    document.getElementById("members").textContent = "Error";
    document.getElementById("borrowedToday").textContent = "Error";
    document.getElementById("returned").textContent = "Error";
  }
}

window.onload = loadDashboard;
