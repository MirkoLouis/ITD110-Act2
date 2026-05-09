// This is the heart of our application. It sets up the web server and defines how 
// the website responds when users click buttons or visit different pages.

const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fileUpload = require('express-fileupload');

// We import the runQuery function from src/db.js to talk to our Neo4j database.
const { runQuery } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars is our "template engine." It helps us create HTML pages dynamically 
// by plugging in data from our database into the files found in src/views.
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        // This simple helper lets us check if two values are equal in our HTML templates.
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware are helper functions that run before our routes.
// 1. static: serves files like CSS and images from the 'public' folder.
// 2. urlencoded: lets us read data sent from HTML forms.
// 3. fileUpload: allows users to upload backup files for the Restore feature.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// --- ROUTES ---
// Routes define the "paths" of our website (like /trace or /backup).

// Homepage: Show a list of all chemicals in the inventory.
// This is the first thing a user sees. We fetch every 'AgriChemical' from Neo4j.
app.get('/', async (req, res) => {
    try {
        const cypher = 'MATCH (c:AgriChemical) RETURN c ORDER BY c.batch_id';
        const result = await runQuery(cypher);
        const chemicals = result.records.map(r => r.get('c').properties);
        res.render('chemicals/list', { 
            chemicals,
            restored: req.query.restored === 'true'
        });
    } catch (error) {
        console.error('List Chemicals Error:', error);
        res.status(500).send('Error loading chemical inventory.');
    }
});

// Trace Analysis Route: Performs the "Threat Intelligence" logic.
// It finds where a chemical went and suggests safe alternative farms.
app.get('/trace', async (req, res) => {
    const { batchId } = req.query;
    console.log(`Trace requested for batch: ${batchId}`);
    
    try {
        // Step 1: Check the status and name of the chemical.
        const statusQuery = `
            MATCH (c:AgriChemical {batch_id: $batchId}) 
            RETURN c.status AS status, c.product_name AS name
        `;
        const statusResult = await runQuery(statusQuery, { batchId });
        
        if (statusResult.records.length === 0) {
            return res.status(404).send('Chemical batch not found.');
        }

        const chemicalStatus = statusResult.records[0].get('status');
        const productName = statusResult.records[0].get('name') || 'Unknown Product';

        // Step 2: Find all markets that received crops treated with this chemical.
        // We follow the path: Chemical <- Farm -> Crop -> (Facility) -> Market.
        const cypher = `
            MATCH (toxic:AgriChemical {batch_id: $batchId})
            <-[:APPLIED]-(farm:Farm)
            -[:PRODUCED]->(crop:CropBatch)
            -[*1..4]->(market:RetailMarket)
            RETURN DISTINCT 
                market.market_id AS market_id, 
                market.name AS market_name, 
                market.address AS market_address, 
                crop.crop_type AS crop_type, 
                crop.batch_id AS crop_batch
        `;

        const result = await runQuery(cypher, { batchId });
        const affectedMarkets = [];

        // Step 3: Resilience Engine.
        // For each affected market, we search for safe farms producing the same crop.
        for (const record of result.records) {
            const mId = record.get('market_id');
            const cType = record.get('crop_type');

            // Find farms producing the same crop that have NO recalled chemicals applied.
            const altQuery = `
                MATCH (safe_farm:Farm)-[:PRODUCED]->(safe_batch:CropBatch {crop_type: $cType})
                WHERE NOT EXISTS {
                    MATCH (safe_farm)-[:APPLIED]->(bad:AgriChemical {status: 'RECALLED'})
                }
                RETURN DISTINCT safe_farm.owner_name AS name, safe_farm.location AS location
                LIMIT 3
            `;
            const altResult = await runQuery(altQuery, { cType });
            const alternatives = altResult.records.map(r => ({
                name: r.get('name'),
                location: r.get('location')
            }));

            affectedMarkets.push({
                market_id: mId,
                market_name: record.get('market_name'),
                market_address: record.get('market_address'),
                crop_type: cType,
                crop_batch: record.get('crop_batch'),
                alternatives
            });
        }

        // Send all this data to the src/views/results.hbs file to be displayed.
        res.render('results', { 
            batchId, 
            productName, 
            chemicalStatus, 
            isRecalled: chemicalStatus === 'RECALLED',
            affectedMarkets 
        });
    } catch (error) {
        console.error('Trace Route Error:', error);
        res.status(500).send('An error occurred during the trace analysis.');
    }
});

// Graph Data: This route provides JSON data specifically for the interactive 
// visualization graph seen on the results page. It's used by src/public/js/graph.js.
app.get('/api/trace-graph', async (req, res) => {
    const { batchId } = req.query;
    
    // We fetch the downstream supply chain starting from the chemical.
    const cypher = `
        MATCH (c:AgriChemical {batch_id: $batchId})
        OPTIONAL MATCH path = (c)<-[:APPLIED]-(farm)-[:PRODUCED|PROCESSED_AT|DISTRIBUTED_TO*0..5]->(end)
        RETURN c, collect(path) AS paths
    `;

    try {
        const result = await runQuery(cypher, { batchId });
        
        let nodes = new Map();
        let edges = new Set();

        result.records.forEach(record => {
            const chemNode = record.get('c');
            const supplyPaths = record.get('paths');

            // Add the starting chemical node.
            nodes.set(chemNode.elementId, { 
                id: chemNode.elementId, 
                label: chemNode.labels[0] + ": " + (chemNode.properties.product_name || chemNode.properties.batch_id),
                group: chemNode.labels[0],
                status: chemNode.properties.status,
                ...chemNode.properties
            });

            // Process the supply chain paths and add every node/connection to the graph.
            supplyPaths.forEach(path => {
                if (path) {
                    path.segments.forEach(segment => {
                        const start = segment.start;
                        const end = segment.end;
                        const rel = segment.relationship;

                        nodes.set(start.elementId, { 
                            id: start.elementId, 
                            label: start.labels[0] + ": " + (start.properties.product_name || start.properties.name || start.properties.batch_id || start.properties.farm_id || start.properties.market_id),
                            group: start.labels[0],
                            ...start.properties
                        });

                        nodes.set(end.elementId, { 
                            id: end.elementId, 
                            label: end.labels[0] + ": " + (end.properties.product_name || end.properties.name || end.properties.batch_id || end.properties.farm_id || end.properties.market_id),
                            group: end.labels[0],
                            ...end.properties
                        });

                        edges.add(JSON.stringify({
                            from: start.elementId,
                            to: end.elementId,
                            label: rel.type
                        }));
                    });
                }
            });
        });

        res.json({
            nodes: Array.from(nodes.values()),
            edges: Array.from(edges).map(e => JSON.parse(e))
        });
    } catch (error) {
        console.error('API Trace Graph Error:', error);
        res.status(500).json({ error: 'Failed to fetch graph data' });
    }
});

// Backup: Download the entire database content as a JSON file.
// This is useful for moving data or saving progress.
app.get('/api/backup', async (req, res) => {
    try {
        const nodesResult = await runQuery('MATCH (n) RETURN n');
        const nodes = nodesResult.records.map(r => {
            const node = r.get('n');
            return {
                id: node.elementId,
                labels: node.labels,
                properties: node.properties
            };
        });

        const relsResult = await runQuery('MATCH (n)-[r]->(m) RETURN r, n, m');
        const relationships = relsResult.records.map(r => {
            const rel = r.get('r');
            return {
                type: rel.type,
                properties: rel.properties,
                fromId: r.get('n').elementId,
                toId: r.get('m').elementId
            };
        });

        const backupData = { nodes, relationships };

        res.setHeader('Content-disposition', 'attachment; filename=agrichain_backup.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify(backupData, null, 4));
    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).send('Failed to generate backup.');
    }
});

// Restore: Upload a JSON backup file to rebuild the entire database.
// This wipe current data and recreates every node and relationship.
app.post('/api/restore', async (req, res) => {
    if (!req.files || !req.files.backupFile) {
        return res.status(400).send('No backup file uploaded.');
    }

    try {
        const backupData = JSON.parse(req.files.backupFile.data.toString());
        
        // 1. Wipe current database.
        await runQuery('MATCH (n) DETACH DELETE n');

        // 2. Recreate Nodes.
        for (const node of backupData.nodes) {
            const labels = node.labels.join(':');
            const query = `CREATE (n:${labels} $props) SET n._old_id = $oldId`;
            await runQuery(query, { props: node.properties, oldId: node.id });
        }

        // 3. Recreate Relationships by matching original IDs.
        for (const rel of backupData.relationships) {
            const query = `
                MATCH (a), (b)
                WHERE a._old_id = $fromId AND b._old_id = $toId
                CREATE (a)-[r:${rel.type} $props]->(b)
            `;
            await runQuery(query, { fromId: rel.fromId, toId: rel.toId, props: rel.properties });
        }

        // 4. Cleanup temporary mapping IDs.
        await runQuery('MATCH (n) REMOVE n._old_id');

        res.redirect('/?restored=true');
    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).send('Failed to restore backup. Ensure the file is a valid AgriChain backup.');
    }
});

// --- CRUD OPERATIONS ---
// These routes handle the "Create, Update, Delete" of AgriChemicals.

// Create: Add a new chemical to the database.
app.post('/chemicals', async (req, res) => {
    const { batch_id, type, manufacturer, status } = req.body;
    try {
        const cypher = 'CREATE (c:AgriChemical {batch_id: $batch_id, type: $type, manufacturer: $manufacturer, status: $status})';
        await runQuery(cypher, { batch_id, type, manufacturer, status });
        res.redirect('/');
    } catch (error) {
        console.error('Create Chemical Error:', error);
        res.status(500).send('Error creating chemical batch.');
    }
});

// Update: Change the status (OK or RECALLED) of a chemical.
app.post('/chemicals/update-status', async (req, res) => {
    const { batch_id, status } = req.body;
    try {
        const cypher = 'MATCH (c:AgriChemical {batch_id: $batch_id}) SET c.status = $status';
        await runQuery(cypher, { batch_id, status });
        res.redirect('/');
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).send('Error updating chemical status.');
    }
});

// Delete: Permanently remove a chemical from the database.
app.post('/chemicals/delete', async (req, res) => {
    const { batch_id } = req.body;
    try {
        const cypher = 'MATCH (c:AgriChemical {batch_id: $batch_id}) DETACH DELETE c';
        await runQuery(cypher, { batch_id });
        res.redirect('/');
    } catch (error) {
        console.error('Delete Chemical Error:', error);
        res.status(500).send('Error deleting chemical batch.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`AgriChain server running at http://localhost:${PORT}`);
});
