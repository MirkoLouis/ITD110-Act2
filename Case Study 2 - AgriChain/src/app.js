const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { runQuery } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Handlebars with 'eq' helper
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// Homepage Redirect to Chemicals Inventory
app.get('/', (req, res) => {
    res.redirect('/chemicals');
});

// Trace Analysis Route (HTML Results)
app.get('/trace', async (req, res) => {
    const { batchId } = req.query;
    console.log(`Trace requested for batch: ${batchId}`);
    
    try {
        const statusQuery = 'MATCH (c:AgriChemical {batch_id: $batchId}) RETURN c.status AS status, c.product_name AS name';
        const statusResult = await runQuery(statusQuery, { batchId });
        
        if (statusResult.records.length === 0) {
            return res.status(404).send('Chemical batch not found.');
        }

        const chemicalStatus = statusResult.records[0].get('status');
        const productName = statusResult.records[0].get('name') || 'Unknown Product';

        // Find affected markets (only if status is RECALLED)
        const cypher = `
            MATCH (toxic:AgriChemical {batch_id: $batchId})
            <-[:APPLIED]-(farm:Farm)
            -[:PRODUCED]->(crop:CropBatch)
            -[*1..4]->(market:RetailMarket)
            RETURN DISTINCT market.name AS market_name, market.address AS market_address, crop.batch_id AS crop_batch
        `;

        const result = await runQuery(cypher, { batchId });
        const affectedMarkets = result.records.map(record => ({
            market_name: record.get('market_name'),
            market_address: record.get('market_address'),
            crop_batch: record.get('crop_batch')
        }));

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

// API endpoint for Graph Visualization - More Robust Version
app.get('/api/trace-graph', async (req, res) => {
    const { batchId } = req.query;
    
    // Improved Cypher: Get the chemical and all downstream paths, even if they don't reach a market.
    const cypher = `
        MATCH (c:AgriChemical {batch_id: $batchId})
        OPTIONAL MATCH path = (c)<-[:APPLIED]-(farm)-[:PRODUCED|PROCESSED_AT|DISTRIBUTED_TO*0..5]->(downstream)
        RETURN c, path
    `;

    try {
        const result = await runQuery(cypher, { batchId });
        
        let nodes = new Map();
        let edges = new Set();

        result.records.forEach(record => {
            const chemNode = record.get('c');
            const path = record.get('path');

            // Always add the starting chemical node
            nodes.set(chemNode.elementId, { 
                id: chemNode.elementId, 
                label: chemNode.labels[0] + ": " + (chemNode.properties.product_name || chemNode.properties.batch_id),
                group: chemNode.labels[0],
                status: chemNode.properties.status // Pass status for custom coloring
            });

            if (path) {
                path.segments.forEach(segment => {
                    const start = segment.start;
                    const end = segment.end;
                    const rel = segment.relationship;

                    nodes.set(start.elementId, { 
                        id: start.elementId, 
                        label: start.labels[0] + ": " + (start.properties.product_name || start.properties.name || start.properties.batch_id || start.properties.farm_id || start.properties.market_id),
                        group: start.labels[0]
                    });

                    nodes.set(end.elementId, { 
                        id: end.elementId, 
                        label: end.labels[0] + ": " + (end.properties.product_name || end.properties.name || end.properties.batch_id || end.properties.farm_id || end.properties.market_id),
                        group: end.labels[0]
                    });

                    edges.add(JSON.stringify({
                        from: start.elementId,
                        to: end.elementId,
                        label: rel.type
                    }));
                });
            }
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

// JSON Backup Feature
app.get('/api/backup', async (req, res) => {
    const cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m';
    try {
        const result = await runQuery(cypher);
        const backupData = result.records.map(record => ({
            node: { labels: record.get('n').labels, properties: record.get('n').properties },
            relationship: record.get('r') ? {
                type: record.get('r').type,
                properties: record.get('r').properties,
                to: { labels: record.get('m').labels, properties: record.get('m').properties }
            } : null
        }));

        res.setHeader('Content-disposition', 'attachment; filename=agrichain_backup.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify(backupData, null, 4));
    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).send('Failed to generate backup.');
    }
});

// --- CRUD OPERATIONS ---

// List Chemicals
app.get('/chemicals', async (req, res) => {
    try {
        const cypher = 'MATCH (c:AgriChemical) RETURN c ORDER BY c.batch_id';
        const result = await runQuery(cypher);
        const chemicals = result.records.map(r => r.get('c').properties);
        res.render('chemicals/list', { chemicals });
    } catch (error) {
        console.error('List Chemicals Error:', error);
        res.status(500).send('Error loading chemical inventory.');
    }
});

// Create Chemical
app.post('/chemicals', async (req, res) => {
    const { batch_id, type, manufacturer, status } = req.body;
    try {
        const cypher = 'CREATE (c:AgriChemical {batch_id: $batch_id, type: $type, manufacturer: $manufacturer, status: $status})';
        await runQuery(cypher, { batch_id, type, manufacturer, status });
        res.redirect('/chemicals');
    } catch (error) {
        console.error('Create Chemical Error:', error);
        res.status(500).send('Error creating chemical batch.');
    }
});

// Update Status
app.post('/chemicals/update-status', async (req, res) => {
    const { batch_id, status } = req.body;
    try {
        const cypher = 'MATCH (c:AgriChemical {batch_id: $batch_id}) SET c.status = $status';
        await runQuery(cypher, { batch_id, status });
        res.redirect('/chemicals');
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).send('Error updating chemical status.');
    }
});

// Delete Chemical
app.post('/chemicals/delete', async (req, res) => {
    const { batch_id } = req.body;
    try {
        const cypher = 'MATCH (c:AgriChemical {batch_id: $batch_id}) DETACH DELETE c';
        await runQuery(cypher, { batch_id });
        res.redirect('/chemicals');
    } catch (error) {
        console.error('Delete Chemical Error:', error);
        res.status(500).send('Error deleting chemical batch.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`AgriChain server running at http://localhost:${PORT}`);
});
