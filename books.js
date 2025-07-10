document.addEventListener('DOMContentLoaded', () => {
  const booksTableBody = document.querySelector('#books-section tbody');
  const bookForm = document.querySelector('form');

  // 🔄 1. Fetch and display books
  async function loadBooks() {
    try {
      const response = await fetch('http://localhost:8080/get_books');
      if (!response.ok) throw new Error('Failed to fetch books');

      const books = await response.json();

      booksTableBody.innerHTML = ''; // Clear table

      books.forEach((book, index) => {
        const row = document.createElement('tr');
        row.className = `border-b hover:bg-cyan-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`;
        row.innerHTML = `
          <td class="py-3 px-4">${book.title}</td>
          <td class="py-3 px-4">${book.author}</td>
          <td class="py-3 px-4">${book.isbn}</td>
          <td class="py-3 px-4">${book.published_year}</td>
          <td class="py-3 px-4">${book.genre}</td>
        `;
        booksTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading books:', err);
      booksTableBody.innerHTML = '<tr><td colspan="5" class="py-4 px-4 text-center text-red-500">Failed to load books</td></tr>';
    }
  }

  // 🔄 2. Add new book
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('add-title').value.trim();
    const author = document.getElementById('add-author').value.trim();
    const isbn = document.getElementById('add-isbn').value.trim();
    const published_year = parseInt(document.getElementById('add-published_year').value.trim());
    const genre = document.getElementById('add-genre').value.trim();

    if (!title || !author || !isbn || isNaN(published_year) || !genre) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const newBook = {
      title,
      author,
      isbn,
      published_year,
      genre
    };

    try {
      const response = await fetch('http://localhost:8080/add_books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert('Book added successfully!');
      bookForm.reset();
      await loadBooks();

    } catch (err) {
      console.error('Error adding book:', err);
      alert('Failed to add book. ' + err.message);
    }
  });

  // Initial load
  loadBooks();
});
