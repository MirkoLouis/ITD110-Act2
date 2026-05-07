const { client } = require('../config/db');

// Parse the semicolon-delimited CSV and bulk-insert into Cassandra
const importDataset = async (req, res) => {
    try {
        const { csv } = req.body;
        if (!csv) {
            return res.status(400).json({ message: 'CSV data is required' });
        }

        const lines = csv.split('\n').filter((l) => l.trim());

        // We expect at least header row and one data row
        if (lines.length < 2) {
            return res.status(400).json({ message: 'CSV must have a header row and at least one data row' });
        }

        // Parse header to get years. Our cleaned CSV has Geolocation, Age Group, 2000, 2001...
        const headerCols = lines[0].split(';').map((c) => c.replace(/"/g, '').trim());
        const years = headerCols.slice(2).map(Number);

        let inserted = 0;
        const queries = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(';').map((c) => c.replace(/"/g, '').trim());
            if (cols.length < 3) continue;

            const region = cols[0].replace(/^\.\./, '').trim(); // remove leading dots if any
            const ageGroup = cols[1].trim();

            for (let j = 0; j < years.length; j++) {
                const val = cols[j + 2];
                // Skip missing data markers: "..", "...", empty
                if (!val || val === '..' || val === '...') continue;

                const rate = parseFloat(val);
                if (isNaN(rate)) continue;

                queries.push({
                    query: `INSERT INTO poverty_by_age_group (region, age_group, year, poverty_rate) VALUES (?, ?, ?, ?)`,
                    params: [region, ageGroup, years[j], rate],
                });
                inserted++;
            }
        }

        // Execute in batches of 30 (Cassandra batch size limit)
        const BATCH_SIZE = 30;
        for (let i = 0; i < queries.length; i += BATCH_SIZE) {
            const batch = queries.slice(i, i + BATCH_SIZE);
            await client.batch(batch, { prepare: true });
        }

        res.json({ message: `Imported ${inserted} data points` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all regions (distinct partition keys)
const getRegions = async (req, res) => {
    try {
        const result = await client.execute('SELECT DISTINCT region FROM poverty_by_age_group');
        const regions = result.rows.map((r) => r.region).sort();
        res.json(regions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all data points for a region
const getByRegion = async (req, res) => {
    try {
        const region = req.params.region.trim();
        const result = await client.execute(
            'SELECT * FROM poverty_by_age_group WHERE region = ?',
            [region],
            { prepare: true }
        );
        const data = result.rows.map((r) => ({
            region: r.region,
            age_group: r.age_group,
            year: r.year,
            poverty_rate: r.poverty_rate,
        }));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single data point
const getOne = async (req, res) => {
    try {
        const { region, age_group, year } = req.params;
        const result = await client.execute(
            'SELECT * FROM poverty_by_age_group WHERE region = ? AND age_group = ? AND year = ?',
            [region.trim(), age_group.trim(), parseInt(year)],
            { prepare: true }
        );
        if (result.rowLength === 0) {
            return res.status(404).json({ message: 'Data point not found' });
        }
        const r = result.rows[0];
        res.json({ region: r.region, age_group: r.age_group, year: r.year, poverty_rate: r.poverty_rate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new data point
const createOne = async (req, res) => {
    try {
        const { region, age_group, year, poverty_rate } = req.body;
        if (!region || !age_group || year == null || poverty_rate == null) {
            return res.status(400).json({ message: 'Region, age_group, year, and poverty_rate are required' });
        }

        await client.execute(
            'INSERT INTO poverty_by_age_group (region, age_group, year, poverty_rate) VALUES (?, ?, ?, ?)',
            [region.trim(), age_group.trim(), parseInt(year), parseFloat(poverty_rate)],
            { prepare: true }
        );

        res.status(201).json({ region: region.trim(), age_group: age_group.trim(), year: parseInt(year), poverty_rate: parseFloat(poverty_rate) });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an existing data point
const updateOne = async (req, res) => {
    try {
        const { region, age_group, year } = req.params;
        const { poverty_rate } = req.body;

        if (poverty_rate == null) {
            return res.status(400).json({ message: 'poverty_rate is required' });
        }

        const existing = await client.execute(
            'SELECT * FROM poverty_by_age_group WHERE region = ? AND age_group = ? AND year = ?',
            [region.trim(), age_group.trim(), parseInt(year)],
            { prepare: true }
        );
        if (existing.rowLength === 0) {
            return res.status(404).json({ message: 'Data point not found' });
        }

        await client.execute(
            'UPDATE poverty_by_age_group SET poverty_rate = ? WHERE region = ? AND age_group = ? AND year = ?',
            [parseFloat(poverty_rate), region.trim(), age_group.trim(), parseInt(year)],
            { prepare: true }
        );

        res.json({ region: region.trim(), age_group: age_group.trim(), year: parseInt(year), poverty_rate: parseFloat(poverty_rate) });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a data point
const deleteOne = async (req, res) => {
    try {
        const { region, age_group, year } = req.params;

        const existing = await client.execute(
            'SELECT * FROM poverty_by_age_group WHERE region = ? AND age_group = ? AND year = ?',
            [region.trim(), age_group.trim(), parseInt(year)],
            { prepare: true }
        );
        if (existing.rowLength === 0) {
            return res.status(404).json({ message: 'Data point not found' });
        }

        await client.execute(
            'DELETE FROM poverty_by_age_group WHERE region = ? AND age_group = ? AND year = ?',
            [region.trim(), age_group.trim(), parseInt(year)],
            { prepare: true }
        );

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { importDataset, getRegions, getByRegion, getOne, createOne, updateOne, deleteOne };
