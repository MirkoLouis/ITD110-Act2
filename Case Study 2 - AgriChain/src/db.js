const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
    )
);

/**
 * Helper to run a Cypher query and close the session automatically.
 * @param {string} cypher - The Cypher query string.
 * @param {object} params - Parameters for the query.
 * @returns {Promise<object>} - Result object.
 */
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

module.exports = {
    driver,
    runQuery
};
