// Return flow: Step 1 - check user loans by phone, Step 2 - return by ISBN

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('returnForm');
  const phoneInput = document.getElementById('userPhone');
  const msgBlock = document.getElementById('returnMsg');
  const isbnSection = document.getElementById('isbnSection');
  const isbnInput = document.getElementById('isbnInput');
  const returnBookBtn = document.getElementById('returnBookBtn');

  let userId = null;
  let userLoans = [];

  // Step 1: Check user loans by phone
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    msgBlock.textContent = '';
    isbnSection.classList.add('hidden');
    const phone = phoneInput.value.trim();
    if (!phone) {
      msgBlock.textContent = 'Please enter a phone number.';
      msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
      return;
    }
    msgBlock.textContent = 'Checking user...';
    msgBlock.className = 'mt-4 text-base font-medium text-center text-gray-600';
    try {
      // 1. Check for overdue books first
      const overdueRes = await fetch('http://localhost:8080/check_overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      if (overdueRes.ok) {
        const overdueData = await overdueRes.json();
        if (overdueData.has_overdue) {
          msgBlock.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="font-semibold text-red-700 mb-2">⚠️ Overdue Books Found!</p>
              <p class="text-red-600 mb-3">${overdueData.message}</p>
              <div class="text-sm text-red-600">
                <p class="font-medium">Overdue Books:</p>
                ${overdueData.overdue_books.map(book => 
                  `<p>• ${book.title} (${book.days_overdue} days overdue)</p>`
                ).join('')}
              </div>
            </div>
          `;
          msgBlock.className = 'mt-4 text-base font-medium text-center';
          return;
        }
      }
      
      // 2. Get user by phone
      const userRes = await fetch('http://localhost:8080/get_users');
      const users = await userRes.json();
      const user = users.find(u => u.phone === phone);
      if (!user) {
        msgBlock.textContent = 'User not found.';
        msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
        return;
      }
      userId = user.user_id;
      // 3. Get all loans for this user
      const loansRes = await fetch('http://localhost:8080/get_loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const loans = await loansRes.json();
      userLoans = loans;
      if (!Array.isArray(userLoans) || userLoans.length === 0) {
        msgBlock.textContent = 'User has nothing to return.';
        msgBlock.className = 'mt-4 text-base font-medium text-center text-yellow-600';
        return;
      }
      msgBlock.textContent = 'User has active loans. Please enter the ISBN of the book to return.';
      msgBlock.className = 'mt-4 text-base font-medium text-center text-green-600';
      isbnSection.classList.remove('hidden');
      isbnInput.focus();
    } catch (err) {
      msgBlock.textContent = 'Error checking user or loans.';
      msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
    }
  });

  // Step 2: Return book by ISBN
  returnBookBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    msgBlock.textContent = '';
    const isbn = isbnInput.value.trim();
    if (!isbn) {
      msgBlock.textContent = 'Please enter the ISBN.';
      msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
      return;
    }
    // Find the loan with this ISBN
    const loan = userLoans.find(l => l.isbn === isbn);
    if (!loan) {
      msgBlock.textContent = 'No active loan found for this ISBN.';
      msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
      return;
    }
    // Send return request
    returnBookBtn.disabled = true;
    returnBookBtn.textContent = 'Processing...';
    try {
      const res = await fetch('http://localhost:8080/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, copyId: loan.copy_id })
      });
      const data = await res.json();
      if (res.ok && data.message && data.message.includes('success')) {
        msgBlock.textContent = 'Book returned successfully!';
        msgBlock.className = 'mt-4 text-base font-medium text-center text-green-600';
        form.reset();
        isbnSection.classList.add('hidden');
      } else {
        msgBlock.textContent = data.message || 'Failed to return book.';
        msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
      }
    } catch (err) {
      msgBlock.textContent = 'Network error. Please try again.';
      msgBlock.className = 'mt-4 text-base font-medium text-center text-red-500';
    } finally {
      returnBookBtn.disabled = false;
      returnBookBtn.textContent = 'Return Book';
    }
  });
});
