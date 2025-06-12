package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-User-ID")
}

func dashboard(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

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
	enableCORS(w)

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

	response := struct {
		AdminID int `json:"admin_id"`
	}{
		AdminID: adminID,
	}

	json.NewEncoder(w).Encode(response)
}

func registration(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

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
	enableCORS(w)

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

	_, err = stmt.Exec(book.Title, book.Author, book.ISBN, book.Published_Year, book.Genre)
	if err != nil {
		http.Error(w, "Error executing insert", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Book added successfully"})
}

func topBooks(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
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

func get_books(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	fmt.Println("Get books endpoint hit")
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT title, author, isbn, published_year, genre FROM books")
	if err != nil {
		http.Error(w, "Error fetching books", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []map[string]interface{}

	for rows.Next() {
		var title, author, isbn, genre string
		var publishedYear int

		if err := rows.Scan(&title, &author, &isbn, &publishedYear, &genre); err != nil {
			http.Error(w, "Error scanning row", http.StatusInternalServerError)
			return
		}

		book := map[string]interface{}{
			"title":          title,
			"author":         author,
			"isbn":           isbn,
			"published_year": publishedYear,
			"genre":          genre,
		}
		books = append(books, book)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error reading rows", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(books)
}

func addUser(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

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
	enableCORS(w)

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
	enableCORS(w)
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
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if reqBody.Phone == "" {
		http.Error(w, "Phone number is required", http.StatusBadRequest)
		return
	}

	fmt.Println("Check user endpoint hit with phone:", reqBody.Phone)

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE phone=?)", reqBody.Phone).Scan(&exists)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]bool{"exists": exists})
}

func main() {
	var err error
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/library_management")
	if err != nil {
		fmt.Println("Error connecting to the database:", err)
		return
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		fmt.Println("Database ping failed:", err)
		return
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Library backend is live!"))
	})

	http.HandleFunc("/dashboard", dashboard)
	http.HandleFunc("/signin", signin)
	http.HandleFunc("/registration", registration)
	http.HandleFunc("/add_books", add_books)
	http.HandleFunc("/top-books", topBooks)
	http.HandleFunc("/get_books", get_books)
	http.HandleFunc("/add_user", addUser)
	http.HandleFunc("/get_users", getUsers)
	http.HandleFunc("/check-user", checkUser)

	fmt.Println("Server started at :8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
