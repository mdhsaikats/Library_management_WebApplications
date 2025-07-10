document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const bookResults = document.getElementById('book-results');

  // Function to create book card with Tailwind styling
  function createBookCard(book) {
    const isAvailable = book.status === 'available';
    
    return `
      <div class="bg-gray-50 p-5 mb-4 rounded-lg border border-gray-200 transition-shadow duration-200 hover:shadow-lg max-h-40 overflow-hidden">
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
          onclick="${isAvailable ? `borrowBook('${book.id}', '${book.available_copy_id || ''}')` : ''}"
        >
          ${isAvailable ? 'Borrow Book' : 'Not Available'}
        </button>
      </div>
    `;
  }

  // Function to handle book borrowing
  window.borrowBook = async function(bookId, copyId) {
    try {
      // Get user ID from localStorage or session
      const userId = localStorage.getItem('userId') || 1; // Default to 1 if not found
      
      if (!copyId) {
        alert('No available copy found for this book.');
        return;
      }
      
      const response = await fetch('http://localhost:8080/borrow_book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          book_id: parseInt(bookId),
          copy_id: parseInt(copyId)
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Success: ${result.message}`);
        // Refresh search results to update availability
        performSearch();
      } else {
        const error = await response.text();
        alert(`Error borrowing book: ${error}`);
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Error borrowing book. Please try again.');
    }
  };

  // Search functionality
  async function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      bookResults.innerHTML = '<p class="text-gray-500 text-center col-span-full">Please enter a search term</p>';
      return;
    }

    try {
      // Show loading state
      bookResults.innerHTML = '<p class="text-gray-500 text-center col-span-full">Searching...</p>';
      
      // Call the actual API endpoint
      const response = await fetch(`http://localhost:8080/search_books?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const books = await response.json();

      if (books.length === 0) {
        bookResults.innerHTML = '<p class="text-gray-500 text-center col-span-full">No books found matching your search</p>';
      } else {
        bookResults.innerHTML = books.map(book => createBookCard(book)).join('');
      }
    } catch (error) {
      console.error('Error searching books:', error);
      bookResults.innerHTML = '<p class="text-red-500 text-center col-span-full">Error searching books. Please try again.</p>';
    }
  }

  // Event listeners
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Get user phone from URL
  const params = new URLSearchParams(window.location.search);
  const userPhone = params.get('user');
  if (userPhone) {
    try {
      // Fetch all users
      const res = await fetch('http://localhost:8080/get_users');
      if (!res.ok) throw new Error();
      const users = await res.json();
      const user = users.find(u => u.phone === userPhone);
      if (user) {
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-phone').textContent = user.phone;
        document.getElementById('user-info').style.display = 'block';
        // window.currentUserId = user.user_id; // Save for borrow actions
      }
    } catch (err) {
      document.getElementById('user-info').style.display = 'none';
    }
  }
});