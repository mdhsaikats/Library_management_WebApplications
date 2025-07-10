# Library Management Web Applications

## Setup Instructions

### Prerequisites
- Go (for backend)
- Node.js and npm (for CSS build process)
- MySQL database

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build CSS for production:**
   ```bash
   npm run build-css
   ```

3. **Start the backend server:**
   ```bash
   npm run start-backend
   ```
   Or use VS Code task: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Backend Server"

### Development

- **Watch CSS changes during development:**
  ```bash
  npm run dev-css
  ```
  Or use VS Code task: "Watch CSS (Development)"

- **The search functionality is now connected to the backend API endpoints:**
  - Search books: `GET /search_books?q=<search_term>`
  - Borrow book: `POST /borrow_book` with JSON body `{user_id, book_id, copy_id}`

### Production

- **Build optimized CSS:**
  ```bash
  npm run build-css
  ```
  Or use VS Code task: "Build CSS (Production)"

## API Endpoints

- `GET /search_books?q=<term>` - Search for books by title, author, or ISBN
- `POST /borrow_book` - Borrow a book (requires user_id, book_id, copy_id)
- `GET /dashboard` - Get dashboard statistics
- And other existing endpoints...

## File Structure

```
├── css/
│   └── output.css          # Generated Tailwind CSS (production-ready)
├── src/
│   └── input.css           # Tailwind CSS source file
├── Library_management_backend/
│   └── main.go             # Go backend server
├── *.html                  # Frontend HTML files
├── *.js                    # Frontend JavaScript files
├── package.json            # Node.js dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── .vscode/
    └── tasks.json          # VS Code tasks for development
```

## Changes Made

✅ **Replaced Tailwind CDN with local production build**
- Removed `<script src="https://cdn.tailwindcss.com"></script>` from all HTML files
- Added `<link rel="stylesheet" href="css/output.css">` to all HTML files
- Set up proper Tailwind CSS build process with npm scripts

✅ **Connected search functionality to backend API**
- Updated `borrow_action.js` to call `/search_books` endpoint
- Connected borrow button to `/borrow_book` endpoint
- Added proper error handling and loading states

✅ **Improved development workflow**
- Added VS Code tasks for easy development
- Added npm scripts for building and watching CSS
- Added proper project structure for production deployment
