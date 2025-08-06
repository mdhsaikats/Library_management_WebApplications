document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const bookResults = document.getElementById('book-results');

  // Function to create book card with Tailwind styling
  function createBookCard(book) {
    const isAvailable = book.status === 'available';
    
    return `
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 flex flex-col h-full">
        <div class="flex-1">
          <h3 class="mt-0 mb-3 text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem]">${book.title}</h3>
          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600"><strong>Author:</strong> <span class="font-normal">${book.author}</span></p>
            <p class="text-sm text-gray-600"><strong>ISBN:</strong> <span class="font-normal">${book.isbn}</span></p>
            <p class="text-sm text-gray-600"><strong>Genre:</strong> <span class="font-normal">${book.genre}</span></p>
            <p class="text-sm text-gray-600"><strong>Year:</strong> <span class="font-normal">${book.published_year || 'N/A'}</span></p>
          </div>
        </div>
        <div class="mt-auto pt-3 border-t border-gray-100">
          <p class="font-semibold mb-3 ${isAvailable ? 'text-green-600' : 'text-red-600'}">
            <span class="inline-block w-2 h-2 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}"></span>
            ${isAvailable ? 'Available' : 'Unavailable'}
          </p>
          <button 
            class="w-full px-4 py-2 text-sm font-medium border-none rounded-lg cursor-pointer transition-all duration-200 ${
              isAvailable 
                ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-sm active:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }"
            ${!isAvailable ? 'disabled' : ''}
            onclick="${isAvailable ? `borrowBook('${book.id}', '${book.available_copy_id || ''}')` : ''}"
          >
            ${isAvailable ? 'Borrow Book' : '❌ Not Available'}
          </button>
        </div>
      </div>
    `;
  }

  // Function to handle book borrowing
  window.borrowBook = async function(bookId, copyId) {
    try {
      // Get user ID from the current user info or localStorage
      let userId = window.currentUserId;
      if (!userId) {
        userId = localStorage.getItem('userId');
      }
      
      if (!userId) {
        alert('Please select a user first from the borrow page.');
        return;
      }

      if (!copyId) {
        alert('No available copy found for this book.');
        return;
      }

      // First check if user has overdue books
      const params = new URLSearchParams(window.location.search);
      const userPhone = params.get('user');
      
      if (userPhone) {
        const overdueRes = await fetch('http://localhost:8080/check_overdue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: userPhone })
        });
        
        if (overdueRes.ok) {
          const overdueData = await overdueRes.json();
          if (overdueData.has_overdue) {
            alert(`❌ Cannot borrow book!\n\n${overdueData.message}\n\nOverdue books:\n${overdueData.overdue_books.map(book => `• ${book.title} (${book.days_overdue} days overdue)`).join('\n')}`);
            return;
          }
        }
      }

      const response = await fetch('http://localhost:8080/borrow_book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          copy_id: parseInt(copyId)
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Success: ${result.message}`);
        // Refresh search results to update availability
        performSearch();
      } else {
        const errorText = await response.text();
        console.error('Backend error borrowing book:', errorText);
        alert(`Error borrowing book: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error borrowing book (network or JS error):', error);
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
        document.getElementById('user-info').classList.remove('hidden');
        window.currentUserId = user.user_id; // Save for borrow actions
      }
    } catch (err) {
      document.getElementById('user-info').classList.add('hidden');
    }
  }
});