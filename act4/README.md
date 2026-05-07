# Philippine Poverty Statistics (SDG 1.2.1)

A full-stack web application using Node.js, Express, and Apache Cassandra to manage and visualize poverty data in the Philippines, aligned with Sustainable Development Goal 1 (No Poverty).

## Tech Stack
- **Backend:** Node.js, Express, Cassandra Driver
- **Database:** Apache Cassandra (NoSQL)
- **Frontend:** HTML5, Vanilla CSS, JavaScript (Fetch API)

## Installation

### Prerequisites
- Node.js
- Apache Cassandra
- Java 17

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure Cassandra is running.
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Open `frontend/index.html` in your browser.

## Features
- **Bulk Import:** Upload CSV data for poverty rates across different regions and age groups.
- **Full CRUD:** Add, Read, Update, and Delete individual data points.
- **Filtering:** Filter records by region.
- **Responsive Design:** Clean, modern UI themed around SDG 1.
