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
	if err := db.QueryRow(`SELECT COUNT(*) FROM loans WHERE issued_on >= CURDATE() AND issued_on < CURDATE() + INTERVAL 1 DAY`).Scan(&data.BorrowedToday); err != nil {
		fmt.Printf("Error fetching borrowed today: %v\n", err)
		http.Error(w, "Error fetching borrowed today", http.StatusInternalServerError)
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
		Email    string `json:"email"`
		Position string `json:"position"`
		Age      int    `json:"age"`
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

	fmt.Println("Server started at :8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
