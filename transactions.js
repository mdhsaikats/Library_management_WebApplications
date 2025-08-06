document.addEventListener('DOMContentLoaded', function () {
  const overdueForm = document.getElementById('overdueForm');
  const overdueMsg = document.getElementById('overdueMsg');
  const overdueList = document.getElementById('overdueList');
  const payButtonSection = document.getElementById('payButtonSection');
  const payAllFinesBtn = document.getElementById('payAllFines');

  let currentPhone = '';
  let currentOverdueBooks = [];

  // Handle overdue book checking and fine payment
  overdueForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    overdueMsg.textContent = '';
    overdueList.innerHTML = '';
    payButtonSection.classList.add('hidden');
    
    const phone = document.getElementById('userPhone').value.trim();
    if (!phone) {
      overdueMsg.textContent = 'Please enter a phone number.';
      overdueMsg.className = 'mt-4 text-base font-medium text-red-500';
      return;
    }

    currentPhone = phone;
    overdueMsg.textContent = 'Checking for overdue books...';
    overdueMsg.className = 'mt-4 text-base font-medium text-gray-600';

    try {
      const response = await fetch('http://localhost:8080/check_overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        throw new Error('Failed to check overdue books');
      }

      const data = await response.json();
      
      if (data.has_overdue) {
        currentOverdueBooks = data.overdue_books;
        overdueMsg.textContent = 'Overdue books found! Please pay fines to continue borrowing/returning.';
        overdueMsg.className = 'mt-4 text-base font-medium text-red-600';
        
        const totalFine = data.overdue_books.reduce((sum, book) => sum + (book.fine_amount || book.days_overdue * 10), 0);
        
        overdueList.innerHTML = `
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 class="font-semibold text-red-700 mb-3"> Overdue Books</h3>
            ${data.overdue_books.map(book => `
              <div class="mb-4 p-3 bg-white border border-red-100 rounded">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-800">${book.title}</p>
                    <p class="text-sm text-gray-600">Author: ${book.author}</p>
                    <p class="text-sm text-gray-600">ISBN: ${book.isbn}</p>
                    <p class="text-sm text-red-600">Overdue: ${book.days_overdue} days</p>
                    <p class="text-sm font-medium text-red-700">Fine: ${book.fine_amount || book.days_overdue * 10} Tk</p>
                  </div>
                  <button 
                    onclick="payFine('${phone}', ${book.copy_id})" 
                    class="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                  >
                    Pay Fine
                  </button>
                </div>
              </div>
            `).join('')}
            <div class="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
              <p class="font-semibold text-red-800">Total Fine Amount: ${totalFine.toFixed(2)} Tk</p>
            </div>
          </div>
        `;
        
        // Show the Pay All Fines button
        payButtonSection.classList.remove('hidden');
      } else {
        overdueMsg.textContent = '✅ No overdue books found! This user can borrow and return books normally.';
        overdueMsg.className = 'mt-4 text-base font-medium text-green-600';
      }
    } catch (error) {
      overdueMsg.textContent = 'Error checking overdue books. Please try again.';
      overdueMsg.className = 'mt-4 text-base font-medium text-red-500';
      console.error('Error:', error);
    }
  });

  // Handle Pay All Fines button
  payAllFinesBtn.addEventListener('click', async function() {
    if (!currentPhone || currentOverdueBooks.length === 0) {
      alert('No overdue books to pay for.');
      return;
    }

    if (!confirm(`Are you sure you want to pay all fines for ${currentOverdueBooks.length} overdue book(s)?`)) {
      return;
    }

    try {
      // First get the user ID from phone
      const userRes = await fetch('http://localhost:8080/get_users');
      const users = await userRes.json();
      const user = users.find(u => u.phone === currentPhone);
      
      if (!user) {
        alert('User not found');
        return;
      }

      let totalPaid = 0;
      let successCount = 0;

      // Pay fine for each overdue book
      for (const book of currentOverdueBooks) {
        try {
          console.log(`Paying fine for book: ${book.title}, userId: ${user.user_id}, copyId: ${book.copy_id}`);
          
          const response = await fetch('http://localhost:8080/pay_fine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: user.user_id, 
              copyId: parseInt(book.copy_id) 
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`Fine paid successfully for ${book.title}:`, result);
            totalPaid += result.fineAmount;
            successCount++;
          } else {
            const errorText = await response.text();
            console.error(`Error paying fine for ${book.title}:`, errorText);
            alert(`Error paying fine for "${book.title}": ${errorText}`);
          }
        } catch (error) {
          console.error(`Error paying fine for book ${book.title}:`, error);
          alert(`Network error paying fine for "${book.title}": ${error.message}`);
        }
      }

      if (successCount > 0) {
        alert(`✅ Successfully paid fines for ${successCount} book(s)!\nTotal amount paid: $${totalPaid.toFixed(2)}\nAll books are now available.`);
        // Refresh the overdue list
        overdueForm.dispatchEvent(new Event('submit'));
      } else {
        alert('❌ Failed to pay any fines. Please try again.');
      }
    } catch (error) {
      console.error('Error paying all fines:', error);
      alert('❌ Error paying fines. Please try again.');
    }
  });

  // Global function for paying individual fines
  window.payFine = async function(phone, copyId) {
    if (!confirm('Are you sure you want to pay the fine for this book?')) {
      return;
    }

    try {
      // First get the user ID from phone
      const userRes = await fetch('http://localhost:8080/get_users');
      const users = await userRes.json();
      const user = users.find(u => u.phone === phone);
      
      if (!user) {
        alert('User not found');
        return;
      }

      console.log(`Paying individual fine - userId: ${user.user_id}, copyId: ${copyId}`);

      const response = await fetch('http://localhost:8080/pay_fine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.user_id, 
          copyId: parseInt(copyId) 
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Fine paid successfully! Amount: $${result.fineAmount}\nBook is now available.`);
        // Refresh the overdue list
        overdueForm.dispatchEvent(new Event('submit'));
      } else {
        const errorText = await response.text();
        console.error('Pay fine error response:', errorText);
        alert(`❌ Error paying fine: ${errorText}`);
      }
    } catch (error) {
      console.error('Error paying fine:', error);
      alert(`❌ Error paying fine: ${error.message}`);
    }
  };
});