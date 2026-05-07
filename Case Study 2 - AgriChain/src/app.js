const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { runQuery } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Trace Analysis Route (HTML Results)
app.get('/trace', async (req, res) => {
    const { batchId } = req.query;
    
    const cypher = `
        MATCH (toxic:AgriChemical {batch_id: $batchId, status: 'RECALLED'})
        <-[:APPLIED]-(farm:Farm)
        -[:PRODUCED]->(crop:CropBatch)
        -[*1..4]->(market:RetailMarket)
        RETURN DISTINCT market.name AS market_name, market.address AS market_address, crop.batch_id AS crop_batch
    `;

    try {
        const result = await runQuery(cypher, { batchId });
        const affectedMarkets = result.records.map(record => ({
            market_name: record.get('market_name'),
            market_address: record.get('market_address'),
            crop_batch: record.get('crop_batch')
        }));

        res.render('results', { batchId, affectedMarkets });
    } catch (error) {
        console.error('Trace Route Error:', error);
        res.status(500).send('An error occurred during the trace analysis.');
    }
});

// API endpoint for Graph Visualization
app.get('/api/trace-graph', async (req, res) => {
    const { batchId } = req.query;
    
    // Cypher to get all paths from the chemical to markets
    const cypher = `
        MATCH path = (toxic:AgriChemical {batch_id: $batchId})
        <-[:APPLIED]-(farm:Farm)
        -[:PRODUCED]->(crop:CropBatch)
        -[*1..4]->(market:RetailMarket)
        RETURN path
    `;

    try {
        const result = await runQuery(cypher, { batchId });
        
        let nodes = new Map();
        let edges = new Set();

        result.records.forEach(record => {
            const path = record.get('path');
            
            path.segments.forEach(segment => {
                const start = segment.start;
                const end = segment.end;
                const rel = segment.relationship;

                nodes.set(start.elementId, { 
                    id: start.elementId, 
                    label: start.labels[0] + ": " + (start.properties.batch_id || start.properties.name || start.properties.farm_id),
                    group: start.labels[0]
                });

                nodes.set(end.elementId, { 
                    id: end.elementId, 
                    label: end.labels[0] + ": " + (end.properties.batch_id || end.properties.name || end.properties.market_id),
                    group: end.labels[0]
                });

                edges.add(JSON.stringify({
                    from: start.elementId,
                    to: end.elementId,
                    label: rel.type
                }));
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

// Start Server
app.listen(PORT, () => {
    console.log(`AgriChain server running at http://localhost:${PORT}`);
});
