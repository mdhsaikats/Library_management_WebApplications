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
	/*
		// Borrowed Today - safer query using date range
		if err := db.QueryRow(`SELECT COUNT(*) FROM borrow_records WHERE borrow_date >= CURDATE() AND borrow_date < CURDATE() + INTERVAL 1 DAY`).Scan(&data.BorrowedToday); err != nil {
			fmt.Printf("Error fetching borrowed today: %v\n", err)
			http.Error(w, "Error fetching borrowed today", http.StatusInternalServerError)
			return
		}

		// Returned Today - safer query using date range
		if err := db.QueryRow(`SELECT COUNT(*) FROM borrow_records WHERE return_date >= CURDATE() AND return_date < CURDATE() + INTERVAL 1 DAY`).Scan(&data.Returned); err != nil {
			fmt.Printf("Error fetching returned: %v\n", err)
			http.Error(w, "Error fetching returned", http.StatusInternalServerError)
			return
		}
	*/
	json.NewEncoder(w).Encode(data)
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

	fmt.Println("Server started at :8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
