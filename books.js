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
          <td class="py-3 px-4 text-center">${book.copy_count || 0}</td>
          <td class="py-3 px-4 text-center">
            <button class="add-copy-btn bg-green-500 hover:bg-green-600 text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg font-bold" title="Add Copy" data-book-id="${book.book_id}">+</button>
          </td>
        `;
        booksTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading books:', err);
      booksTableBody.innerHTML = '<tr><td colspan="7" class="py-4 px-4 text-center text-red-500">Failed to load books</td></tr>';
    }
  }

  // Handle add copy button click
  booksTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('add-copy-btn')) {
      const bookId = e.target.getAttribute('data-book-id');
      if (!bookId) return;
      // Optionally, prompt for number of copies
      // const count = parseInt(prompt('How many copies to add?', '1')) || 1;
      const count = 1;
      try {
        const response = await fetch('http://localhost:8080/add_book_copies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book_id: parseInt(bookId), count })
        });
        if (!response.ok) throw new Error(await response.text());
        alert('Book copy added!');
        loadBooks();
      } catch (err) {
        alert('Failed to add book copy. ' + err.message);
      }
    }
  });

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
