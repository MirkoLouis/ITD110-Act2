**ITD110 – NoSQL Databases**  
**Lab Exercises \#4**  
**Exploring Column-Family Stores NoSQL Databases with Apache Cassandra \+ Node.js**

**Objective**  
This laboratory activity introduces Apache Cassandra (a Column-Family NoSQL database) in a full-stack web application. The backend uses Node.js with the DataStax Cassandra Driver and CQL operations through a complete CRUD application.

## **Prerequisites**

### **1\. Node.js** *(Skip if already installed on the previous Lab exercises)*

**macOS:** brew install node **Windows:** Download the LTS installer from [https://nodejs.org/](https://nodejs.org/) and follow the prompts.

Verify: node \--version and npm \--version

### **2\. Java 17** *(Required by Cassandra)*

**macOS:** Installed automatically with Cassandra via Homebrew. 

**Windows:** Download **Temurin JDK 17** from [https://adoptium.net/](https://adoptium.net/). During installation, enable **Set JAVA\_HOME variable**.

Verify: java \-version

### **3\. Homebrew** *(macOS only)*

/bin/bash \-c "$(curl \-fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

**4\. Apache Cassandra**

**macOS:**

brew install cassandra  
brew services start cassandra

**Windows:**

1. Download the latest release from [https://cassandra.apache.org/\_/download.html](https://cassandra.apache.org/_/download.html) and extract to C:\\cassandra.  
2. Add C:\\cassandra\\bin to your system PATH (via **System Properties \> Environment Variables**).  
3. Open Command Prompt and run cassandra. Wait for Startup complete, then **keep this window open**.  
   **Verify Cassandra is ready** (wait 30–60 seconds after starting, then open a new terminal):  
   Cqlsh  
     
   You should see Connected to Test Cluster at 127.0.0.1:9042. Type exit to leave.  
   **Windows note:** If cqlsh shows a Python error, install Python 3.11 from [https://www.python.org/downloads/](https://www.python.org/downloads/) with **Add Python to PATH** checked.

   ### **5\. AxonOps Workbench** *(Optional GUI)*

   Download from [https://axonops.com/workbench/](https://axonops.com/workbench/). Connect using:  
* Host: localhost  
* Port: 9042  
* Datacenter: datacenter1  
* Leave username/password blank.  
    
  6\. Project Structure

  ## 

  [**Download the source code (Backend & Frontend)**](https://drive.google.com/drive/folders/1qBLUEHudFUuT1egl7fLdQlE-G43JnpG4?usp=sharing)


  itd110\_cassandra/  
  ├── backend/  
  │   ├── .env  
  │   ├── config/db.js  
  │   ├── controllers/electricityController.js  
  │   ├── routes/electricityRoutes.js  
  │   ├── package.json  
  │   └── server.js  
  ├── frontend/  
  │   ├── index.html  
  │   ├── css/styles.css  
  │   └── js/app.js  
  └── Proportion of population with access to electricity (...).csv


  ### **Backend Files**

| File | Purpose |
| :---- | :---- |
| server.js | Express server entry point (port 3000\) |
| config/db.js | Connects to Cassandra; creates keyspace and table on startup |
| controllers/electricityController.js | CSV import, CRUD logic |
| routes/electricityRoutes.js | API endpoint definitions |
| .env | Cassandra connection settings |

## **Part 1: Verify Cassandra is Running**

## Start Cassandra if not already running:

* ## macOS: brew services start cassandra

* ## Windows: Run cassandra in Command Prompt and keep the window open.

  ## *Then confirm with cqlsh. The electricity keyspace and table do not exist yet, they are created automatically when the backend starts.*

## **Part 2: Start the Backend**

### **Step 1** — Navigate to the backend folder

## cd path/to/itd110\_cassandra/backend

## **Step 2** — Install dependencies

## npm install

### **Step 3** — Confirm .env settings

PORT=3000  
CASSANDRA\_CONTACT\_POINTS=127.0.0.1  
CASSANDRA\_DATACENTER=datacenter1  
CASSANDRA\_KEYSPACE=electricity

*No changes are needed for a default local Cassandra setup.*

### **Step 4** — Start the server

npm start

*On startup, the backend automatically creates the electricity keyspace. Keep this terminal open. Press Ctrl \+ C to stop.*

## **Part 3: Use the Frontend**

## Open frontend/index.html in your browser.

### Import Data

1. ## Click Choose File and select the provided CSV file.

2. ## Click Import CSV. A success message will confirm the number of imported records (expected: 234).

3. ## The table and region filter populate automatically.

### **Verify in cqlsh**

## USE electricity;

## SELECT \* FROM electricity\_by\_region WHERE region \= 'PHILIPPINES';

## SELECT COUNT(\*) FROM electricity\_by\_region;

## **Restarting Later**

1. ## Start Cassandra.

2. ## Run npm start in the backend/ folder.

3. ## Open frontend/index.html in your browser.

**Activity Tasks**

1. Ensure your web application is fully functional.   
2. Implement import csv and full CRUD (Create, Read, Update, Delete) functionality to manage data effectively.  
3. Enhance the front-end design to provide a more intuitive and user-friendly experience.  
   

**Challenge**  
Select a dataset from the Sustainable Development Goals (SDGs) under the Philippine Indicators in the [SDG Database](https://openstat.psa.gov.ph/Database/Sustainable-Development-Goals). Then, modify the web application to align with and support the chosen SDG dataset.

**Deliverables**

1. Source code (github link)  
2. Short video clip of working and completed output

## 

