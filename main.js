async function loadDashboard() {
  try {
    const response = await fetch("http://localhost:8080/dashboard");
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    const data = await response.json();

    // Update the text values
    document.getElementById("totalBooks").textContent = data.total_books;
    document.getElementById("members").textContent = data.members;
    document.getElementById("borrowedToday").textContent = data.borrowed_today;
    document.getElementById("returned").textContent = data.returned;

    // Render the chart
    const ctx = document.getElementById("dashboardChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Total Books", "Members", "Borrowed Today", "Returned"],
        datasets: [{
          label: "Library Statistics",
          data: [
            data.total_books,
            data.members,
            data.borrowed_today,
            data.returned
          ],
          backgroundColor: [
            "#fcd34d", // Total Books - yellow
            "#34d399", // Members - green
            "#f43f5e", // Borrowed - red
            "#0284c7"  // Returned - blue
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1
          }
        }
      }
    });

  } catch (error) {
    console.error("Dashboard load error:", error);
    document.getElementById("totalBooks").textContent = "Error";
    document.getElementById("members").textContent = "Error";
    document.getElementById("borrowedToday").textContent = "Error";
    document.getElementById("returned").textContent = "Error";
  }
}

async function loadMostPopularBooks() {
  try {
    const response = await fetch("http://localhost:8080/top-books");
    if (!response.ok) throw new Error("Failed to fetch most popular books");
    const books = await response.json();
    const ul = document.getElementById("mostPopularBooks");
    ul.innerHTML = "";
    if (books.length === 0) {
      ul.innerHTML = "<li>No data</li>";
      return;
    }
    books.forEach(book => {
      const li = document.createElement("li");
      li.textContent = `${book.title} (${book.count} times)`;
      ul.appendChild(li);
    });
  } catch (error) {
    document.getElementById("mostPopularBooks").innerHTML = "<li>Error loading data</li>";
  }
}

// Call this function on page load
window.onload = function() {
  loadDashboard();
  loadMostPopularBooks();
  // ...call other load functions if needed...
};
