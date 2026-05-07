const cassandra = require('cassandra-driver');

const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1').split(',');
const localDataCenter = process.env.CASSANDRA_DATACENTER || 'datacenter1';
const keyspace = process.env.CASSANDRA_KEYSPACE || 'poverty_sdg';

const bootstrapClient = new cassandra.Client({
    contactPoints,
    localDataCenter,
});

const client = new cassandra.Client({
    contactPoints,
    localDataCenter,
    keyspace,
});

const connectDB = async () => {
    try {
        await bootstrapClient.connect();
        await bootstrapClient.execute(
            `CREATE KEYSPACE IF NOT EXISTS ${keyspace}
             WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }`
        );
        await bootstrapClient.shutdown();

        await client.connect();

        // Time-series table: one partition per region, rows ordered by age_group and year descending.
        await client.execute(`
            CREATE TABLE IF NOT EXISTS poverty_by_age_group (
                region text,
                age_group text,
                year int,
                poverty_rate double,
                PRIMARY KEY ((region), age_group, year)
            ) WITH CLUSTERING ORDER BY (age_group ASC, year DESC)
        `);

        console.log(`Cassandra Connected (keyspace: ${keyspace})`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB, client };
