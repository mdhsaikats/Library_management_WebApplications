package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

// CORS middleware for chi
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-User-ID")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func dashboard(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var data struct {
		TotalBooks    int `json:"total_books"`
		Members       int `json:"members"`
		BorrowedToday int `json:"borrowed_today"`
		Returned      int `json:"returned"`
	}

	// Total Books
	if err := db.QueryRow("SELECT COUNT(*) FROM books").Scan(&data.TotalBooks); err != nil {
		fmt.Printf("Error fetching total books: %v\n", err)
		http.Error(w, "Error fetching total books", http.StatusInternalServerError)
		return
	}

	// Members
	if err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&data.Members); err != nil {
		fmt.Printf("Error fetching members: %v\n", err)
		http.Error(w, "Error fetching members", http.StatusInternalServerError)
		return
	}
	// Borrowed Today - safer query using date range
	if err := db.QueryRow(`SELECT COUNT(*) FROM loans`).Scan(&data.BorrowedToday); err != nil {
		fmt.Printf("Error fetching total borrowed: %v\n", err)
		http.Error(w, "Error fetching total borrowed", http.StatusInternalServerError)
		return
	}

	// Returned Today - safer query using date range
	if err := db.QueryRow(`SELECT COUNT(*) FROM loans WHERE returned_on >= CURDATE() AND returned_on < CURDATE() + INTERVAL 1 DAY`).Scan(&data.Returned); err != nil {
		fmt.Printf("Error fetching returned: %v\n", err)
		http.Error(w, "Error fetching returned", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(data)
}

func signin(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	query := "SELECT admin_id FROM admin WHERE username = ? AND password_hash = ? ORDER BY admin_id DESC LIMIT 1"
	var adminID int
	if err := db.QueryRow(query, credentials.Username, credentials.Password).Scan(&adminID); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		http.Error(w, "Error querying database", http.StatusInternalServerError)
		return
	}

	// Send admin_id as JSON
	response := struct {
		AdminID int `json:"admin_id"`
	}{
		AdminID: adminID,
	}

	jsonResp, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(jsonResp)
}

func registration(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var user struct {
		Fullname string `json:"full_name"`
		Position string `json:"position"`
		Age      string `json:"age"`
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	query := "INSERT INTO admin (full_name, position, age, email, username, password_hash) VALUES (?, ?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		http.Error(w, "Error preparing statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(user.Fullname, user.Position, user.Age, user.Email, user.Username, user.Password)
	if err != nil {
		http.Error(w, "Error executing statement", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	response := struct {
		Message string `json:"message"`
	}{
		Message: "User registered successfully",
	}

	json.NewEncoder(w).Encode(response)
}

func add_books(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	fmt.Println("Add books endpoint hit")
	w.Header().Set("Content-Type", "application/json")

	var book struct {
		Title          string `json:"title"`
		Author         string `json:"author"`
		ISBN           string `json:"isbn"`
		Published_Year int    `json:"published_year"`
		Genre          string `json:"genre"`
	}

	if err := json.NewDecoder(r.Body).Decode(&book); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	query := "INSERT INTO books (title, author, isbn, published_year, genre) VALUES (?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		http.Error(w, "Error preparing statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	res, err := stmt.Exec(book.Title, book.Author, book.ISBN, book.Published_Year, book.Genre)
	if err != nil {
		http.Error(w, "Error executing insert", http.StatusInternalServerError)
		return
	}

	// Get the new book_id
	bookID, err := res.LastInsertId()
	if err != nil {
		http.Error(w, "Error getting new book ID", http.StatusInternalServerError)
		return
	}

	// Insert the first copy for this book
	_, err = db.Exec("INSERT INTO bookcopies (book_id, status) VALUES (?, 'available')", bookID)
	if err != nil {
		http.Error(w, "Error creating initial book copy", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Book added successfully with 1 copy"})
}

func topBooks(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	type Book struct {
		Title string `json:"title"`
		Count int    `json:"count"`
	}

	rows, err := db.Query(`
		SELECT b.title, COUNT(*) AS borrow_count
	FROM loans l
	JOIN bookcopies bc ON l.copy_id = bc.copy_id
	JOIN books b ON bc.book_id = b.book_id
	GROUP BY b.book_id, b.title
	ORDER BY borrow_count DESC
	LIMIT 5;

	`)
	if err != nil {
		http.Error(w, "Error fetching top books", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []Book
	for rows.Next() {
		var book Book
		if err := rows.Scan(&book.Title, &book.Count); err != nil {
			http.Error(w, "Error scanning book", http.StatusInternalServerError)
			return
		}
		books = append(books, book)
	}
	json.NewEncoder(w).Encode(books)
}

func searchBooks(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	query := r.URL.Query().Get("query")
	if query == "" {
		http.Error(w, "Query parameter is required", http.StatusBadRequest)
		return
	}
	// Join books with bookcopies and aggregate available copies
	rows, err := db.Query(`
		SELECT b.book_id, b.title, b.author, b.isbn, b.published_year, b.genre,
		  COALESCE(MIN(CASE WHEN bc.status = 'available' THEN bc.copy_id END), 0) AS available_copy_id,
		  COUNT(CASE WHEN bc.status = 'available' THEN 1 END) AS available_count
		FROM books b
		LEFT JOIN bookcopies bc ON b.book_id = bc.book_id
		WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.genre LIKE ?
		GROUP BY b.book_id, b.title, b.author, b.isbn, b.published_year, b.genre
	`, "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%")
	if err != nil {
		http.Error(w, "Error fetching books", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type Book struct {
		BookID          int    `json:"book_id"`
		Title           string `json:"title"`
		Author          string `json:"author"`
		ISBN            string `json:"isbn"`
		PublishedYear   int    `json:"published_year"`
		Genre           string `json:"genre"`
		Status          string `json:"status"`
		AvailableCopyID int    `json:"available_copy_id"`
	}
	var books []Book
	for rows.Next() {
		var book Book
		var availableCount int
		if err := rows.Scan(&book.BookID, &book.Title, &book.Author, &book.ISBN, &book.PublishedYear, &book.Genre, &book.AvailableCopyID, &availableCount); err != nil {
			http.Error(w, "Error scanning book", http.StatusInternalServerError)
			return
		}
		if availableCount > 0 && book.AvailableCopyID != 0 {
			book.Status = "available"
		} else {
			book.Status = "unavailable"
			book.AvailableCopyID = 0
		}
		books = append(books, book)
	}
	if err := rows.Err(); err != nil {
		http.Error(w, "Row iteration error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(books)
}

// get_books handler returns all books in the database as JSON
func get_books(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(`
			   SELECT b.book_id, b.title, b.author, b.isbn, b.published_year, b.genre, COUNT(bc.copy_id) AS copy_count
			   FROM books b
			   LEFT JOIN bookcopies bc ON b.book_id = bc.book_id
			   GROUP BY b.book_id, b.title, b.author, b.isbn, b.published_year, b.genre
	   `)
	if err != nil {
		http.Error(w, "Error fetching books", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Book struct {
		BookID        int    `json:"book_id"`
		Title         string `json:"title"`
		Author        string `json:"author"`
		ISBN          string `json:"isbn"`
		PublishedYear int    `json:"published_year"`
		Genre         string `json:"genre"`
		CopyCount     int    `json:"copy_count"`
	}

	var books []Book

	for rows.Next() {
		var book Book
		err := rows.Scan(&book.BookID, &book.Title, &book.Author, &book.ISBN, &book.PublishedYear, &book.Genre, &book.CopyCount)
		if err != nil {
			http.Error(w, "Error scanning book", http.StatusInternalServerError)
			return
		}
		books = append(books, book)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Row iteration error", http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(books)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}
}

func addUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	fmt.Println("Add user endpoint hit")
	w.Header().Set("Content-Type", "application/json")

	var user struct {
		Fullname string `json:"name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	query := "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		http.Error(w, "Error preparing statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(user.Fullname, user.Email, user.Phone)
	if err != nil {
		http.Error(w, "Error executing insert", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "User added successfully"})
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT user_id, name, email, phone FROM users")
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type User struct {
		UserID int    `json:"user_id"`
		Name   string `json:"name"`
		Email  string `json:"email"`
		Phone  string `json:"phone"`
	}

	var users []User

	for rows.Next() {
		var user User
		err := rows.Scan(&user.UserID, &user.Name, &user.Email, &user.Phone)
		if err != nil {
			http.Error(w, "Error scanning user", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Row iteration error", http.StatusInternalServerError)
		return
	}

	// ✅ Encode the result as JSON
	err = json.NewEncoder(w).Encode(users)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}
}

func checkUser(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	type RequestBody struct {
		Phone string `json:"phone"`
	}
	var reqBody RequestBody

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		fmt.Println("[checkUser] Invalid request body:", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if reqBody.Phone == "" {
		fmt.Println("[checkUser] Phone number is required")
		http.Error(w, "Phone number is required", http.StatusBadRequest)
		return
	}

	fmt.Println("[checkUser] Endpoint hit with phone:", reqBody.Phone)

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE phone=?)", reqBody.Phone).Scan(&exists)
	if err != nil {
		fmt.Println("[checkUser] DB error:", err)
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("[checkUser] Exists:", exists)
	json.NewEncoder(w).Encode(map[string]bool{"exists": exists})
}

func getAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Get admin_id from query parameter
	adminID := r.URL.Query().Get("admin_id")
	if adminID == "" {
		http.Error(w, "admin_id is required", http.StatusBadRequest)
		return
	}

	var admin struct {
		FullName string `json:"full_name"`
		Position string `json:"position"`
		Age      string `json:"age"`
		Email    string `json:"email"`
		Username string `json:"username"`
	}

	// Query for the specific admin (removed joining_date)
	err := db.QueryRow("SELECT full_name, position, age, email, username FROM admin WHERE admin_id = ?", adminID).
		Scan(&admin.FullName, &admin.Position, &admin.Age, &admin.Email, &admin.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Admin not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error fetching admin", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(admin)
}

func borrowBook(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var request struct {
		UserID int `json:"user_id"`
		CopyID int `json:"copy_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the book_id for the requested copy
	var bookID int
	err := db.QueryRow("SELECT book_id FROM bookcopies WHERE copy_id = ?", request.CopyID).Scan(&bookID)
	if err != nil {
		http.Error(w, "Invalid book copy", http.StatusBadRequest)
		return
	}

	// Check if the user already has an active loan for this book
	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM loans l JOIN bookcopies bc ON l.copy_id = bc.copy_id WHERE l.user_id = ? AND bc.book_id = ? AND l.returned_on IS NULL`, request.UserID, bookID).Scan(&count)
	if err != nil {
		http.Error(w, "Error checking existing loans", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "User already has an active loan for this book", http.StatusBadRequest)
		return
	}

	// Insert into loans
	query := "INSERT INTO loans (user_id, copy_id) VALUES (?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		http.Error(w, "Error preparing statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(request.UserID, request.CopyID)
	if err != nil {
		http.Error(w, "Error executing insert", http.StatusInternalServerError)
		return
	}

	// Mark the copy as borrowed
	_, err = db.Exec("UPDATE bookcopies SET status = 'borrowed' WHERE copy_id = ?", request.CopyID)
	if err != nil {
		http.Error(w, "Error updating book copy status", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Book borrowed successfully"})
}

// POST /get_loans { phone }
func getLoans(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	var request struct {
		Phone string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if request.Phone == "" {
		http.Error(w, "Phone number is required", http.StatusBadRequest)
		return
	}
	// Check if the user exists
	var userID int
	err := db.QueryRow("SELECT user_id FROM users WHERE phone = ?", request.Phone).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error checking user", http.StatusInternalServerError)
		return
	}
	// Get the user's active loans (with copy_id, isbn, title, author)
	type Loan struct {
		CopyID int    `json:"copy_id"`
		ISBN   string `json:"isbn"`
		Title  string `json:"title"`
		Author string `json:"author"`
	}
	var loans []Loan
	rows, err := db.Query(`SELECT l.copy_id, b.isbn, b.title, b.author FROM loans l JOIN bookcopies bc ON l.copy_id = bc.copy_id JOIN books b ON bc.book_id = b.book_id WHERE l.user_id = ? AND l.returned_on IS NULL`, userID)
	if err != nil {
		http.Error(w, "Error fetching loans", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var loan Loan
		if err := rows.Scan(&loan.CopyID, &loan.ISBN, &loan.Title, &loan.Author); err != nil {
			http.Error(w, "Error scanning loan", http.StatusInternalServerError)
			return
		}
		loans = append(loans, loan)
	}
	json.NewEncoder(w).Encode(loans)
}

// POST /return { userId, copyId }
func returnBook(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	var request struct {
		UserID int `json:"userId"`
		CopyID int `json:"copyId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if request.UserID == 0 || request.CopyID == 0 {
		http.Error(w, "User ID and Copy ID are required", http.StatusBadRequest)
		return
	}
	// Update the loan record to set returned_on
	query := "UPDATE loans SET returned_on = NOW() WHERE user_id = ? AND copy_id = ? AND returned_on IS NULL"
	stmt, err := db.Prepare(query)
	if err != nil {
		http.Error(w, "Error preparing statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()
	result, err := stmt.Exec(request.UserID, request.CopyID)
	if err != nil {
		http.Error(w, "Error executing update", http.StatusInternalServerError)
		return
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		http.Error(w, "No active loan found for this user and copy", http.StatusNotFound)
		return
	}
	// Mark the copy as available
	_, err = db.Exec("UPDATE bookcopies SET status = 'available' WHERE copy_id = ?", request.CopyID)
	if err != nil {
		http.Error(w, "Error updating book copy status", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Book returned successfully"})
}

func addBookCopies(w http.ResponseWriter, r *http.Request) {
	var req struct {
		BookID int `json:"book_id"`
		Count  int `json:"count"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	for i := 0; i < req.Count; i++ {
		_, err := db.Exec("INSERT INTO bookcopies (book_id, status) VALUES (?, 'available')", req.BookID)
		if err != nil {
			http.Error(w, "Failed to add book copy", 500)
			return
		}
	}
	w.Write([]byte(`{"message":"Book copies added successfully"}`))
}

func main() {
	var err error
	db, err = sql.Open("mysql", "root:29112003@tcp(127.0.0.1:3306)/library_management")
	if err != nil {
		fmt.Println("Error connecting to the database:", err)
		return
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		fmt.Println("Database ping failed:", err)
		return
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(corsMiddleware) // <-- Add CORS middleware globally

	r.Get("/dashboard", dashboard)
	r.Post("/signin", signin)
	r.Post("/registration", registration)
	r.Post("/add_books", add_books)
	r.Get("/top-books", topBooks)
	r.Get("/get_books", get_books)
	r.Post("/add_user", addUser)
	r.Get("/get_users", getUsers)
	r.Post("/check-user", checkUser)
	r.Get("/get_admin", getAdmin)
	r.Get("/search_books", searchBooks)
	r.Post("/borrow_book", borrowBook)
	r.Post("/return", returnBook)
	r.Post("/get_loans", getLoans)
	r.Post("/add_book_copies", addBookCopies)

	fmt.Println("Server started at :8080")
	err = http.ListenAndServe(":8080", r)
	if err != nil {
		panic(err)
	}
}
