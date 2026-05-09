const { runQuery, driver } = require('../src/db');

/**
 * Seed data for AgriChain project - v1.4 Reliable Seeding.
 * Fixes the variable shadowing bug in Cypher by separating paths into distinct queries.
 */
const seedData = async () => {
    console.log('--- Starting Reliable Enriched Database Seeding ---');

    try {
        // 1. Clear all existing data
        console.log('Resetting database...');
        await runQuery('MATCH (n) DETACH DELETE n');

        // 2. Create All Nodes First
        console.log('Creating Nodes...');
        await runQuery(`
            // Chemicals
            CREATE (:AgriChemical {batch_id: 'CHEM-BKN-001', type: 'Fertilizer', manufacturer: 'AgriGrow Solutions', product_name: 'Ammonium Sulfate (21-0-0)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-MIS-002', type: 'Fertilizer', manufacturer: 'BioShield Inc', product_name: 'Potassium Chloride (0-0-60)', status: 'RECALLED'})
            CREATE (:AgriChemical {batch_id: 'CHEM-BKN-003', type: 'Fertilizer', manufacturer: 'Local Salt Co', product_name: 'Common Salt (NaCl)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-PEST-004', type: 'Fungicide', manufacturer: 'Sharphil Inc', product_name: 'Azoxystrobin (Zoxy 250 SC)', status: 'RECALLED'})
            CREATE (:AgriChemical {batch_id: 'CHEM-PEST-005', type: 'Insecticide', manufacturer: 'Link Agritech', product_name: 'Diazinon (Zenon)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-UREA-006', type: 'Fertilizer', manufacturer: 'Fertilizer Corp Phil', product_name: 'Urea (46-0-0)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-COMP-007', type: 'Fertilizer', manufacturer: 'Atlas Fertilizer', product_name: 'Complete (14-14-14)', status: 'OK'})

            // Farms
            CREATE (:Farm {farm_id: 'FARM-BKN-MANOLO', owner_name: 'Manolo Fortich Highland Farm', location: 'Manolo Fortich, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-MIS-CLAVERIA', owner_name: 'Claveria Vegetable Co-op', location: 'Claveria, Misamis Oriental'})
            CREATE (:Farm {farm_id: 'FARM-BKN-TALAKAG', owner_name: 'Miarayon Highland Farm', location: 'Talakag, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-VALENCIA', owner_name: 'Valencia Rice/Corn Estates', location: 'Valencia City, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-LDN-TUBOD', owner_name: 'BARCOCO Bualan Co-op', location: 'Tubod, Lanao del Norte'})
            CREATE (:Farm {farm_id: 'FARM-ILG-PALAO', owner_name: 'Izon Highland Farm', location: 'Pala-o, Iligan City'})

            // Crops
            CREATE (:CropBatch {batch_id: 'BATCH-BAN-SABA-01', crop_type: 'Saba Banana', harvest_date: '2026-05-01'})
            CREATE (:CropBatch {batch_id: 'BATCH-COC-CLAV-01', crop_type: 'Coconut', harvest_date: '2026-05-05'})
            CREATE (:CropBatch {batch_id: 'BATCH-VEG-TAL-01', crop_type: 'Carrots', harvest_date: '2026-05-10'})
            CREATE (:CropBatch {batch_id: 'BATCH-CORN-VAL-01', crop_type: 'Yellow Corn', harvest_date: '2026-05-12'})
            CREATE (:CropBatch {batch_id: 'BATCH-DAIRY-LDN-01', crop_type: 'Fresh Milk', harvest_date: '2026-05-14'})
            CREATE (:CropBatch {batch_id: 'BATCH-SAK-MUN-01', crop_type: 'Sakurab (Scallion)', harvest_date: '2026-05-15'})

            // Processing
            CREATE (:ProcessingFacility {facility_id: 'PROC-TAG-GARDENIA', name: 'Gardenia Bread Plant', location: 'PHIVIDEC, Tagoloan', type: 'Bakery Manufacturing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-TAG-OISHI', name: 'Liwayway (Oishi) Plant', location: 'PHIVIDEC, Tagoloan', type: 'Snack Food Processing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-BKN-HUB', name: 'Bukidnon Food Hub', location: 'Manolo Fortich', type: 'Agri-Logistics & Processing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-LDN-MILK', name: 'SND Milk Processing Plant', location: 'Sultan Naga Dimaporo, LDN', type: 'Dairy Processing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-ILG-KAPE', name: 'Agri-Rainbow Coffee Plant', location: 'Iligan City', type: 'Coffee & Spice Processing'})

            // Markets
            CREATE (:RetailMarket {market_id: 'MKT-CDO-COGON', name: 'Cogon Public Market', address: 'Cagayan de Oro City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-PALAO', name: 'Pala-o Central Market', address: 'Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-TAMBO', name: 'Tambo Public Market', address: 'Tambo, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-ROB', name: 'Robinsons Place Iligan', address: 'Macapagal Ave, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-BKN-TAL', name: 'Talakag Regional Food Terminal', address: 'Talakag, Bukidnon'})
        `);

        // 3. Establish Relationships one-by-one to avoid shadowing
        console.log('Establishing Connectivity...');

        const paths = [
            // PATH 1: CHEM-MIS-002
            `MATCH (f:Farm {farm_id: 'FARM-MIS-CLAVERIA'}), (c:AgriChemical {batch_id: 'CHEM-MIS-002'}), (b:CropBatch {batch_id: 'BATCH-COC-CLAV-01'}), (p:ProcessingFacility {facility_id: 'PROC-TAG-OISHI'}), (m:RetailMarket {market_id: 'MKT-ILG-PALAO'})
             CREATE (f)-[:APPLIED]->(c), (f)-[:PRODUCED]->(b), (b)-[:PROCESSED_AT]->(p), (p)-[:DISTRIBUTED_TO]->(m)`,

            // PATH 2: CHEM-PEST-004
            `MATCH (f:Farm {farm_id: 'FARM-BKN-MANOLO'}), (c:AgriChemical {batch_id: 'CHEM-PEST-004'}), (b:CropBatch {batch_id: 'BATCH-BAN-SABA-01'}), (p:ProcessingFacility {facility_id: 'PROC-BKN-HUB'}), (m:RetailMarket {market_id: 'MKT-ILG-TAMBO'})
             CREATE (f)-[:APPLIED]->(c), (f)-[:PRODUCED]->(b), (b)-[:PROCESSED_AT]->(p), (p)-[:DISTRIBUTED_TO]->(m)`,

            // PATH 3: CHEM-BKN-001
            `MATCH (f:Farm {farm_id: 'FARM-LDN-TUBOD'}), (c:AgriChemical {batch_id: 'CHEM-BKN-001'}), (b:CropBatch {batch_id: 'BATCH-DAIRY-LDN-01'}), (p:ProcessingFacility {facility_id: 'PROC-LDN-MILK'}), (m:RetailMarket {market_id: 'MKT-ILG-ROB'})
             CREATE (f)-[:APPLIED]->(c), (f)-[:PRODUCED]->(b), (b)-[:PROCESSED_AT]->(p), (p)-[:DISTRIBUTED_TO]->(m)`,

            // PATH 4: CHEM-BKN-003
            `MATCH (f:Farm {farm_id: 'FARM-BKN-TALAKAG'}), (c:AgriChemical {batch_id: 'CHEM-BKN-003'}), (b:CropBatch {batch_id: 'BATCH-VEG-TAL-01'}), (m:RetailMarket {market_id: 'MKT-BKN-TAL'})
             CREATE (f)-[:APPLIED]->(c), (f)-[:PRODUCED]->(b), (b)-[:DISTRIBUTED_TO]->(m)`,

            // PATH 5: CHEM-PEST-005
            `MATCH (f:Farm {farm_id: 'FARM-BKN-VALENCIA'}), (c:AgriChemical {batch_id: 'CHEM-PEST-005'}), (b:CropBatch {batch_id: 'BATCH-CORN-VAL-01'}), (p:ProcessingFacility {facility_id: 'PROC-VAL-MILL'}), (m:RetailMarket {market_id: 'MKT-CDO-COGON'})
             CREATE (f)-[:APPLIED]->(c), (f)-[:PRODUCED]->(b), (b)-[:PROCESSED_AT]->(p), (p)-[:DISTRIBUTED_TO]->(m)`,

            // PATH 6: CHEM-UREA-006
            `MATCH (f:Farm {farm_id: 'FARM-ILG-PALAO'}), (c:AgriChemical {batch_id: 'CHEM-UREA-006'}), (b:CropBatch {batch_id: 'BATCH-SAK-MUN-01'}), (p:ProcessingFacility {facility_id: 'PROC-ILG-KAPE'}), (m:RetailMarket {market_id: 'MKT-ILG-PALAO'})
             CREATE (f)-[:APPLIED]->(c), (f)-[:PRODUCED]->(b), (b)-[:PROCESSED_AT]->(p), (p)-[:DISTRIBUTED_TO]->(m)`,

            // PATH 7: CHEM-COMP-007
            `MATCH (f:Farm {farm_id: 'FARM-MIS-CLAVERIA'}), (c:AgriChemical {batch_id: 'CHEM-COMP-007'}), (b:CropBatch {batch_id: 'BATCH-COC-CLAV-01'}), (p:ProcessingFacility {facility_id: 'PROC-TAG-GARDENIA'}), (m:RetailMarket {market_id: 'MKT-CDO-COGON'})
             CREATE (f)-[:APPLIED]->(c), (b)-[:PROCESSED_AT]->(p), (p)-[:DISTRIBUTED_TO]->(m)`
        ];

        for (const query of paths) {
            await runQuery(query);
        }

        console.log('--- Reliable Seeding Completed Successfully ---');
    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await driver.close();
        process.exit();
    }
};

seedData();
