const { runQuery, driver } = require('../src/db');

/**
 * Seed data for AgriChain project.
 * Models Northern Mindanao agricultural supply chain (Saba bananas & coconuts).
 */
const seedData = async () => {
    console.log('--- Starting Database Seeding ---');

    try {
        // 1. Clear existing data
        console.log('Cleaning existing data...');
        await runQuery('MATCH (n) DETACH DELETE n');

        // 2. Create AgriChemicals
        console.log('Creating AgriChemicals...');
        await runQuery(`
            CREATE (c1:AgriChemical {batch_id: 'CHEM-9942', type: 'Fertilizer', manufacturer: 'AgriGrow Solutions', status: 'RECALLED'})
            CREATE (c2:AgriChemical {batch_id: 'CHEM-1022', type: 'Pesticide', manufacturer: 'BioShield Inc', status: 'OK'})
        `);

        // 3. Create Farms
        console.log('Creating Farms...');
        await runQuery(`
            CREATE (f1:Farm {farm_id: 'FARM-BUK-01', owner_name: 'Juan Dela Cruz', location_coordinates: '8.1284, 125.1274'})
            CREATE (f2:Farm {farm_id: 'FARM-BUK-02', owner_name: 'Maria Santos', location_coordinates: '8.1300, 125.1350'})
            CREATE (f3:Farm {farm_id: 'FARM-MISOR-01', owner_name: 'Roberto Lim', location_coordinates: '8.4542, 124.6319'})
        `);

        // 4. Create CropBatches
        console.log('Creating CropBatches...');
        await runQuery(`
            CREATE (b1:CropBatch {batch_id: 'BATCH-BAN-001', crop_type: 'Saba Banana', harvest_date: '2026-04-15'})
            CREATE (b2:CropBatch {batch_id: 'BATCH-BAN-002', crop_type: 'Saba Banana', harvest_date: '2026-04-18'})
            CREATE (b3:CropBatch {batch_id: 'BATCH-COC-101', crop_type: 'Coconut', harvest_date: '2026-04-20'})
        `);

        // 5. Create Processing Facilities
        console.log('Creating Processing Facilities...');
        await runQuery(`
            CREATE (p1:ProcessingFacility {facility_id: 'PROC-CDO-01', name: 'Oro Processing Center', type: 'Banana Chip Plant'})
            CREATE (p2:ProcessingFacility {facility_id: 'PROC-ILG-01', name: 'Iligan Coconut Oil Mill', type: 'Oil Extraction'})
        `);

        // 6. Create Retail Markets
        console.log('Creating Retail Markets...');
        await runQuery(`
            CREATE (m1:RetailMarket {market_id: 'MKT-CDO-COG', name: 'Cogon Public Market', address: 'CDO City'})
            CREATE (m2:RetailMarket {market_id: 'MKT-CDO-CAR', name: 'Carmen Public Market', address: 'CDO City'})
            CREATE (m3:RetailMarket {market_id: 'MKT-VAL-PUB', name: 'Valencia Public Market', address: 'Valencia, Bukidnon'})
        `);

        // 7. Create Relationships
        console.log('Establishing relationships...');
        await runQuery(`
            // Farm 1 applied contaminated fertilizer
            MATCH (f:Farm {farm_id: 'FARM-BUK-01'}), (c:AgriChemical {batch_id: 'CHEM-9942'})
            CREATE (f)-[:APPLIED {date_applied: '2026-03-01'}]->(c)

            // Farm 2 used safe pesticide
            MATCH (f:Farm {farm_id: 'FARM-BUK-02'}), (c:AgriChemical {batch_id: 'CHEM-1022'})
            CREATE (f)-[:APPLIED {date_applied: '2026-03-05'}]->(c)

            // Production links
            MATCH (f1:Farm {farm_id: 'FARM-BUK-01'}), (b1:CropBatch {batch_id: 'BATCH-BAN-001'})
            CREATE (f1)-[:PRODUCED]->(b1)

            MATCH (f2:Farm {farm_id: 'FARM-BUK-02'}), (b2:CropBatch {batch_id: 'BATCH-BAN-002'})
            CREATE (f2)-[:PRODUCED]->(b2)

            MATCH (f3:Farm {farm_id: 'FARM-MISOR-01'}), (b3:CropBatch {batch_id: 'BATCH-COC-101'})
            CREATE (f3)-[:PRODUCED]->(b3)

            // Processing links
            MATCH (b1:CropBatch {batch_id: 'BATCH-BAN-001'}), (p1:ProcessingFacility {facility_id: 'PROC-CDO-01'})
            CREATE (b1)-[:PROCESSED_AT {arrival_date: '2026-04-16'}]->(p1)

            MATCH (b2:CropBatch {batch_id: 'BATCH-BAN-002'}), (p1:ProcessingFacility {facility_id: 'PROC-CDO-01'})
            CREATE (b2)-[:PROCESSED_AT {arrival_date: '2026-04-19'}]->(p1)

            MATCH (b3:CropBatch {batch_id: 'BATCH-COC-101'}), (p2:ProcessingFacility {facility_id: 'PROC-ILG-01'})
            CREATE (b3)-[:PROCESSED_AT {arrival_date: '2026-04-22'}]->(p2)

            // Distribution links
            MATCH (p1:ProcessingFacility {facility_id: 'PROC-CDO-01'}), (m1:RetailMarket {market_id: 'MKT-CDO-COG'})
            CREATE (p1)-[:DISTRIBUTED_TO {delivery_date: '2026-04-20'}]->(m1)

            MATCH (p1:ProcessingFacility {facility_id: 'PROC-CDO-01'}), (m2:RetailMarket {market_id: 'MKT-CDO-CAR'})
            CREATE (p1)-[:DISTRIBUTED_TO {delivery_date: '2026-04-21'}]->(m2)

            MATCH (p2:ProcessingFacility {facility_id: 'PROC-ILG-01'}), (m3:RetailMarket {market_id: 'MKT-VAL-PUB'})
            CREATE (p2)-[:DISTRIBUTED_TO {delivery_date: '2026-04-25'}]->(m3)
        `);

        console.log('--- Database Seeding Completed Successfully ---');
    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await driver.close();
        process.exit();
    }
};

seedData();
