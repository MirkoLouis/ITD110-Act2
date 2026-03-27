**ITD110 – NoSQL Databases**  
**Lab Exercises \#3**  
**Exploring Graph NoSQL Databases with Neo4j \+ Node.js**

**Objective**  
This laboratory activity aims to familiarize students with the installation, configuration, and interaction of a Graph NoSQL database (Redis) in a full-stack web application environment. The backend will be developed using Node.js.

## **Prerequisites**

## Node.js v16+ installed ([download here](https://nodejs.org/en) if not yet installed on the previous Lab exercises)

[Download the source code (Backend & Frontend)](https://drive.google.com/drive/folders/1hr1kduAB942BcJ3fKGI_Psiqwca6wrto?usp=sharing)

### **Backend Files**

| File Path | Description |
| :---- | :---- |
| server.js | Express.js entry point. Sets up CORS, JSON parsing, registers API routes, connects to Neo4j, and starts the server on port 5001\. |
| config/db.js | Neo4j connection manager. Initializes the Bolt driver, verifies the connection, and provides session creation for controllers. |
| controllers/studentController.js | Student CRUD logic. Executes Cypher queries to create, read, update, and delete Student nodes and their ENROLLED\_IN relationships to Courses. |
| controllers/facultyController.js | Faculty CRUD logic. Same pattern as studentController but manages Faculty nodes and TEACHES relationships to Courses. |
| controllers/courseController.js | Course CRUD logic. Manages Course nodes and returns associated enrolled Students and teaching Faculty from graph relationships. |
| routes/studentRoutes.js | Defines REST endpoints for /api/students — GET (all/one), POST, PUT, DELETE. |
| routes/facultyRoutes.js | Defines REST endpoints for /api/faculty — GET (all/one), POST, PUT, DELETE. |
| routes/courseRoutes.js | Defines REST endpoints for /api/courses — GET (all/one), POST, PUT, DELETE. |
| .env | Environment config: server port, Neo4j URI, credentials, and database name. PORT=5001 NEO4J\_URI=bolt://localhost:7687 NEO4J\_USER=neo4j NEO4J\_PASSWORD=12345678 NEO4J\_DATABASE=itd110 |
| package.json | Backend dependencies (express, neo4j-driver, cors, dotenv, uuid) and scripts (start, dev). |

### **Frontend Files**

| File Path | Description |
| :---- | :---- |
| index.html | Student page. Sidebar navigation, form for adding/editing students with course enrollment dropdown, and student list table. |
| faculty.html | Faculty page. Form for adding/editing faculty with teaching load dropdown, and faculty list table. |
| course.html | Course page. Form for adding/editing courses, and table showing courses with enrolled students and teaching faculty. |
| js/app.js | Student page logic. Handles form submission (add/edit), fetches and renders students, populates course dropdown, and manages delete with confirmation. |
| js/faculty.js | Faculty page logic. Same pattern as app.js — CRUD operations for faculty with teaching course selection. |
| js/course.js | Course page logic. CRUD operations for courses; renders enrolled students and teaching faculty in read-only columns. |
| css/styles.css | Global stylesheet. Fixed dark sidebar, card-style containers, blue table headers, orange edit/red delete buttons, form styling.  |

**Part 1: Set Up Neo4j Database**

1. Install Neo4j Desktop from [https://neo4j.com/download/](https://neo4j.com/download/)   
2. Open Neo4j Desktop, click "New Project"  
3. Click "Add" → "Local DBMS"  
4. Set the password to 12345678 (matching the .env config), then click "Create"  
5. Click "Start" to run the database  
6. Wait until the status shows "Active" (green indicator)  
7. Verify by opening http://localhost:7474 in your browser — you should see the Neo4j Browser

**Part 2: Start the Backend**

1. Open a terminal and navigate to the backend folder:  
   cd backend  
2. Install dependencies:  
   npm install  
3. Verify the .env file has the correct Neo4j password. It should contain:  
   

   PORT=5001  
   NEO4J\_URI=bolt://localhost:7687  
   NEO4J\_USER=neo4j  
   NEO4J\_PASSWORD=12345678  
   NEO4J\_DATABASE=itd110

     
4. Start the backend server:  
   npm run dev  
5. You should see this output confirming a successful connection:  
   

   Neo4j Connected: localhost:7687  
   Server running on port 5001  
   

   If it fails, make sure Neo4j is running and the password in .env is correct.  
6. Keep this terminal open — the backend must stay running.

**Part 3: Open the Frontend**  
The frontend is plain HTML/CSS/JS with no build step.

1. Open the frontend/index.html file directly in your browser:  
   

   Option A: Double-click the file in Finder/Explorer  
   Option B: In a new terminal, run:

   cd frontend  
   npx serve .

   Then open the URL it prints (usually [http://localhost:3000](http://localhost:3000))  
     
2. **The Students page will load. Use the sidebar on the left to navigate between:**

   Students — manage students and course enrollments

   Faculty — manage faculty and teaching assignments

   Courses — manage courses

   

**Activity Tasks**

1. Ensure your web application is fully functional. Add at least two(2) nodes and establish a relationship with another node.  
2. Implement full CRUD (Create, Read, Update, Delete) functionality to manage data effectively.  
3. Enhance the front-end design to provide a more intuitive and user-friendly experience.  
   

**Deliverables**

1. Source code (github link)  
2. Short video clip of working and completed output

