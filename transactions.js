document.getElementById('transactionForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const phone = document.getElementById('userPhone').value.trim();
  document.getElementById('txnMsg').textContent = "";
  document.getElementById('txnList').innerHTML = "";

  // Get user ID from phone
  let userID;
  try {
    const res = await fetch('http://localhost:8080/get_users');
    const users = await res.json();
    const user = users.find(u => u.phone === phone);
    if (!user) {
      document.getElementById('txnMsg').textContent = "User not found.";
      return;
    }
    userID = user.user_id;
  } catch {
    document.getElementById('txnMsg').textContent = "Error fetching user info.";
    return;
  }

  // Get all loans for user
  let loans;
  try {
    const res = await fetch('http://localhost:8080/get_loans', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    loans = await res.json();
  } catch {
    document.getElementById('txnMsg').textContent = "Error fetching loans.";
    return;
  }

  // Filter for returned books with unpaid fines
  const txnList = document.getElementById('txnList');
  let found = false;
  for (const loan of loans) {
    if (loan.returned_on) {
      // Calculate overdue days
      const dueDate = new Date(loan.issued_on);
      dueDate.setDate(dueDate.getDate() + 7); // 7 days loan period
      const returnedDate = new Date(loan.returned_on);
      const overdueDays = Math.max(0, Math.floor((returnedDate - dueDate) / (1000 * 60 * 60 * 24)));
      const fineAmount = overdueDays * 10;
      if (fineAmount > 0 && !loan.fine_paid) {
        found = true;
        const txnDiv = document.createElement('div');
        txnDiv.className = "mb-6 p-4 border border-red-300 rounded-lg bg-red-50";
        txnDiv.innerHTML = `
          <div class="mb-2 font-semibold text-gray-700">Book: ${loan.title || ''} (ISBN: ${loan.isbn || ''})</div>
          <div class="mb-2">Returned on: <span class="font-mono">${loan.returned_on}</span></div>
          <div class="mb-2">Due date: <span class="font-mono">${dueDate.toISOString().slice(0,10)}</span></div>
          <div class="mb-2 text-red-700 font-bold">Fine: ${fineAmount} TK</div>
          <button class="payBtn w-full p-3 mt-2 text-white rounded-md bg-red-600 hover:bg-red-700" data-loanid="${loan.loan_id}" data-copyid="${loan.copy_id}">Pay Fine & Complete Return</button>
        `;
        txnList.appendChild(txnDiv);
      }
    }
  }
  if (!found) {
    txnList.innerHTML = `<div class="text-green-700 font-semibold">No unpaid fines or overdue returns for this user.</div>`;
  }
});

// Handle pay fine button click
document.getElementById('txnList').addEventListener('click', async function(e) {
  if (e.target.classList.contains('payBtn')) {
    const copyID = e.target.getAttribute('data-copyid');
    const phone = document.getElementById('userPhone').value.trim();
    let userID;
    try {
      const res = await fetch('http://localhost:8080/get_users');
      const users = await res.json();
      const user = users.find(u => u.phone === phone);
      if (!user) {
        document.getElementById('txnMsg').textContent = "User not found.";
        return;
      }
      userID = user.user_id;
    } catch {
      document.getElementById('txnMsg').textContent = "Error fetching user info.";
      return;
    }
    // Pay fine
    try {
      const res = await fetch('http://localhost:8080/pay_fine', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userID, copyId: copyID })
      });
      const result = await res.json();
      if (result.message) {
        e.target.parentElement.innerHTML = `<div class="text-green-700 font-semibold">${result.message}</div>`;
      } else {
        e.target.parentElement.innerHTML = `<div class="text-green-700 font-semibold">Fine paid and book returned!</div>`;
      }
    } catch {
      e.target.parentElement.innerHTML = `<div class="text-red-700 font-semibold">Error processing payment.</div>`;
    }
  }
});