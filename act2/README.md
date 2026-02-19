# Student Management System

A simple CRUD application for managing student records using Node.js, Express, and Redis.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express
- **Database:** Redis (v6.2+)

## Features
- Add new students with Name, Email, Course, Age, and Networth.
- View list of all students.
- Edit existing student records.
- Delete student records.
- Automatic currency formatting for Networth (PHP).

## Installation

1. Clone the repository.
2. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file in the `backend` directory with your Redis configuration.
   ```env
   PORT=3000
   REDIS_URL=redis://localhost:6379
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. Open `frontend/index.html` in your browser.
