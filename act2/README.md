# Student Management System

A simple CRUD application for managing student records using Node.js, Express, and Redis.

## Tech Stack
- **Frontend:** React (TypeScript), Vite
- **Backend:** Node.js, Express
- **Database:** Redis (v6.2+)

## Features
- Add new students with Name, Email, Course, Age, and Networth.
- View list of all students.
- Edit existing student records.
- Delete student records.
- Automatic currency formatting for Networth (PHP).

## Installation & Running the Application

### 1. Backend Setup (Common)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=3000
   REDIS_URL=redis://localhost:6379
   ```
4. Start the backend:
   ```bash
   npm start
   ```

---

### 2. Choose Your Frontend

#### Option A: Vanilla JavaScript (Original)
1. Ensure the backend is running.
2. Open `frontend/index.html` directly in your browser.
   - *Note: This version uses plain HTML and JavaScript as required by the initial lab task.*

#### Option B: React (Modern)
1. Navigate to the `frontend-react` directory:
   ```bash
   cd frontend-react
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the URL provided in the terminal (usually `http://localhost:5173`).
   - *Note: This version introduces React + TypeScript for improved state management and modern development patterns.*


