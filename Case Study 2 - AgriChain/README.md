# AgriChain 🌾

[![Neo4j](https://img.shields.io/badge/Database-Neo4j-008CC1?style=flat&logo=neo4j)](https://neo4j.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Handlebars](https://img.shields.io/badge/Frontend-Handlebars-FF7D00?style=flat&logo=handlebars.js)](https://handlebarsjs.com/)

**AgriChain** is a graph-driven, farm-to-table traceability and threat intelligence web application for Northern Mindanao. Developed in fulfillment of the requirements for **ITD110 - NoSQL Databases** ([Case Study #2](./ITD110%20-%20Case%20Study%20%232.md)), it models the agricultural economy as an interconnected web, allowing for instantaneous contamination tracing and supply chain resilience.

## 🚀 Core Features
- **Multi-Tier Traceability:** Track agricultural products from industrial raw materials (Tier 3) to retail markets.
- **Affected Area Analysis:** Rapidly identify all markets and regions impacted by a contaminated chemical batch.
- **Resilience Engine:** Intelligent recommendation of safe alternative farm sources during recall events.
- **Interactive Visualization:** Dynamic graph mapping of supply chains using `vis-network`.
- **Data Management:** Full CRUD operations for chemical batches and JSON graph backups.

## 🧠 Why Neo4j? (The Graph Advantage)
AgriChain leverages Neo4j to solve the "Deep Traversal" problem inherent in supply chains.

### SQL vs. Graph
| Feature | Relational (SQL) | Graph (Neo4j) |
| :--- | :--- | :--- |
| **Performance** | Slows exponentially with depth (Recursive JOINs). | Constant time traversal via direct pointers. |
| **Data Model** | Rigid tables and foreign keys. | Flexible nodes and semantic relationships. |
| **Speed** | Seconds/Minutes for deep tracing. | Milliseconds for multi-tier tracing. |

**The Technical Difference:** SQL must compute connections "on the fly" by scanning tables. Neo4j uses **Index-Free Adjacency**, where relationships are physically stored as memory pointers on disk. Finding a path in Neo4j is as simple as following a string from one point to another.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** Neo4j (Graph Database)
- **Templating:** Handlebars (hbs)
- **Visualization:** vis-network

## 📥 Installation & Setup

1. **Setup Neo4j Container:**
   ```bash
   podman run --name agrichain-neo4j \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password \
     -d neo4j:latest
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file:
   ```env
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=password
   PORT=3000
   ```

4. **Seed the Database:**
   ```bash
   npm run seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 📖 Documentation
Detailed project context and architecture can be found in [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md).

---
© 2026 AgriChain. Built for Northern Mindanao Agriculture Intelligence.
