const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fileUpload = require('express-fileupload');
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
app.use(fileUpload());

// --- ROUTES ---

// Homepage: List Chemicals (Root)
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

// Trace Analysis Route (HTML Results)
app.get('/trace', async (req, res) => {
    const { batchId } = req.query;
    console.log(`Trace requested for batch: ${batchId}`);
    
    try {
        const statusQuery = `
            MATCH (c:AgriChemical {batch_id: $batchId}) 
            OPTIONAL MATCH (r:RawMaterial)-[:SUPPLIED_TO]->(c)
            RETURN c.status AS status, c.product_name AS name, collect(r.name) AS raw_materials
        `;
        const statusResult = await runQuery(statusQuery, { batchId });
        
        if (statusResult.records.length === 0) {
            return res.status(404).send('Chemical batch not found.');
        }

        const chemicalStatus = statusResult.records[0].get('status');
        const productName = statusResult.records[0].get('name') || 'Unknown Product';
        const rawMaterials = statusResult.records[0].get('raw_materials');

        // Find affected markets and the crops they received from the toxic source
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

        // For each affected market, find alternative safe sources for that specific crop
        for (const record of result.records) {
            const mId = record.get('market_id');
            const cType = record.get('crop_type');

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

        res.render('results', { 
            batchId, 
            productName, 
            chemicalStatus, 
            rawMaterials,
            isRecalled: chemicalStatus === 'RECALLED',
            affectedMarkets 
        });
    } catch (error) {
        console.error('Trace Route Error:', error);
        res.status(500).send('An error occurred during the trace analysis.');
    }
});

// API endpoint for Graph Visualization
app.get('/api/trace-graph', async (req, res) => {
    const { batchId } = req.query;
    
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

            nodes.set(chemNode.elementId, { 
                id: chemNode.elementId, 
                label: chemNode.labels[0] + ": " + (chemNode.properties.product_name || chemNode.properties.batch_id),
                group: chemNode.labels[0],
                status: chemNode.properties.status
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

// JSON Backup Feature (Full Graph Export)
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

// JSON Restore Feature (Full Graph Import)
app.post('/api/restore', async (req, res) => {
    if (!req.files || !req.files.backupFile) {
        return res.status(400).send('No backup file uploaded.');
    }

    try {
        const backupData = JSON.parse(req.files.backupFile.data.toString());
        
        await runQuery('MATCH (n) DETACH DELETE n');

        for (const node of backupData.nodes) {
            const labels = node.labels.join(':');
            const query = `CREATE (n:${labels} $props) SET n._old_id = $oldId`;
            await runQuery(query, { props: node.properties, oldId: node.id });
        }

        for (const rel of backupData.relationships) {
            const query = `
                MATCH (a), (b)
                WHERE a._old_id = $fromId AND b._old_id = $toId
                CREATE (a)-[r:${rel.type} $props]->(b)
            `;
            await runQuery(query, { fromId: rel.fromId, toId: rel.toId, props: rel.properties });
        }

        await runQuery('MATCH (n) REMOVE n._old_id');

        res.redirect('/?restored=true');
    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).send('Failed to restore backup. Ensure the file is a valid AgriChain backup.');
    }
});

// --- CRUD OPERATIONS ---

// Create Chemical
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

// Update Status
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

// Delete Chemical
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
