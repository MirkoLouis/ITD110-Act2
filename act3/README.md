# School Management System (Neo4j + Node.js)

A full-stack Graph NoSQL database application designed to manage Students, Faculty, and Courses using Neo4j. This project demonstrates complex many-to-many relationships through graph nodes and edges.

## 🚀 Features
- **Student Management**: Register students and enroll them in multiple courses.
- **Faculty Management**: Manage professor profiles and their teaching loads.
- **Course Catalog**: Define courses with credits and view real-time enrollment/teaching data.
- **Graph Relationships**: 
  - `(Student)-[:ENROLLED_IN]->(Course)`
  - `(Faculty)-[:TEACHES]->(Course)`
- **Modern UI**: Professional dashboard with a dark sidebar and clean card-based components.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: Neo4j (Graph Database)
- **Frontend**: Vanilla HTML5, CSS3 (Modern Inter Font), JavaScript (ES6+)
- **Communication**: REST API / Bolt Protocol

## 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Neo4j Desktop](https://neo4j.com/download/) installed and running.

## ⚙️ Installation & Setup

### 1. Database Setup
1. Open **Neo4j Desktop**.
2. Create a new **Local DBMS**.
3. Set the database name to `itd110`.
4. Set the password to `12345678`.
5. Click **Start**.

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### 3. Seed Data (Optional)
To quickly populate the graph with sample data and relationships:
```bash
node backend/seed.js
```

### 4. Frontend Setup
Simply open `frontend/index.html` in your favorite web browser, or use a live server:
```bash
cd frontend
npx serve .
```

## 📁 Project Structure
```text
.
├── backend/
│   ├── config/          # DB Connection
│   ├── controllers/     # CRUD Logic
│   ├── routes/          # API Endpoints
│   ├── server.js        # Entry Point
│   └── seed.js          # Automation Script
└── frontend/
    ├── css/             # Modern Styles
    ├── js/              # UI Logic
    └── *.html           # Dashboard Pages
```

## 📝 License
This project was developed for the ITD110 - NoSQL Databases Laboratory Activity #3.
