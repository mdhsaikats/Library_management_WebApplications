document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const bookResults = document.getElementById('book-results');

  // Function to create book card with Tailwind styling
  function createBookCard(book) {
    const isAvailable = book.status === 'available';
    
    return `
      <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 transition-shadow duration-200 hover:shadow-lg">
        <h3 class="mt-0 mb-2 text-lg font-semibold text-gray-800">${book.title}</h3>
        <p class="text-gray-600 mb-1"><strong>Author:</strong> ${book.author}</p>
        <p class="text-gray-600 mb-1"><strong>ISBN:</strong> ${book.isbn}</p>
        <p class="text-gray-600 mb-1"><strong>Genre:</strong> ${book.genre}</p>
        <p class="font-bold mt-2 ${isAvailable ? 'text-green-600' : 'text-red-600'}">
          Status: ${isAvailable ? 'Available' : 'Unavailable'}
        </p>
        <button 
          class="mt-4 px-4 py-2 text-sm border-none rounded cursor-pointer transition-colors duration-200 ${
            isAvailable 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-400 text-white cursor-not-allowed'
          }"
          ${!isAvailable ? 'disabled' : ''}
          onclick="${isAvailable ? `borrowBook('${book.id}')` : ''}"
        >
          ${isAvailable ? 'Borrow Book' : 'Not Available'}
        </button>
      </div>
    `;
  }

  // Function to handle book borrowing
  window.borrowBook = function(bookId) {
    // Add your borrow logic here
    alert(`Borrowing book with ID: ${bookId}`);
  };

  // Search functionality
  function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      bookResults.innerHTML = '<p class="text-gray-500 text-center col-span-full">Please enter a search term</p>';
      return;
    }

    // Mock search results - replace with actual API call
    const mockBooks = [
      { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', genre: 'Fiction', status: 'available' },
      { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780446310789', genre: 'Fiction', status: 'unavailable' },
      { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', genre: 'Dystopian', status: 'available' }
    ];

    // Filter books based on search term
    const filteredBooks = mockBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
    );

    if (filteredBooks.length === 0) {
      bookResults.innerHTML = '<p class="text-gray-500 text-center col-span-full">No books found matching your search</p>';
    } else {
      bookResults.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
    }
  }

  // Event listeners
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
});