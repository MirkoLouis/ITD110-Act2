# AgriChain

Graph-driven, farm-to-table traceability and threat intelligence web application for Northern Mindanao.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** Neo4j (Graph Database)
- **Templating:** Handlebars (hbs)
- **Frontend:** HTML/CSS (Green Theme), vis-network (Graph Visualization)

## Prerequisites
- Node.js (v18+)
- Podman or Docker (for Neo4j)

## Installation & Setup
1. **Clone the repository.**
2. **Setup Neo4j Container:**
   ```bash
   podman run --name agrichain-neo4j \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password \
     -d neo4j:latest
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Environment Variables:**
   Create a `.env` file:
   ```env
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=password
   PORT=3000
   ```
5. **Run the Application:**
   The application is assumed to be running in a background terminal.
   ```bash
   npm start
   ```

## Development
This project follows strict engineering standards:
- 4-space indentation.
- Robust error handling.
- CSS variables for theme management.
