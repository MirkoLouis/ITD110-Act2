// This file sets up the connection to our Neo4j graph database.
// It provides the tools we need to talk to the database from our main application (src/app.js).

const neo4j = require('neo4j-driver');
require('dotenv').config();

// Initialize the Neo4j driver using credentials from the .env file.
// The driver acts as the "bridge" between our Node.js code and the database server.
const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
    )
);

// This helper function simplifies how we run Cypher queries.
// Instead of manually opening and closing "sessions" every time, this function
// handles the cleanup (closing the session) for us, ensuring the database connections are managed properly.
// This is used by our routes in src/app.js to fetch agricultural data.
async function runQuery(cypher, params = {}) {
    const session = driver.session();
    try {
        const result = await session.run(cypher, params);
        return result;
    } catch (error) {
        console.error('Neo4j Query Error:', error);
        throw error;
    } finally {
        await session.close();
    }
}

// Export the driver and runQuery function so they can be used throughout the project.
module.exports = {
    driver,
    runQuery
};
