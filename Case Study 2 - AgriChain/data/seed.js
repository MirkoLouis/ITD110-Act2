const { runQuery, driver } = require('../src/db');

/**
 * Seed data for AgriChain project - v1.6.1 Diversified Distribution Dataset (Fixed Cypher).
 * Ensures each farm distributes its 5 crop batches to 5 unique markets.
 */
const seedData = async () => {
    console.log('--- Starting Diversified Dataset Seeding ---');

    try {
        // 1. Clear all existing data
        console.log('Resetting database...');
        await runQuery('MATCH (n) DETACH DELETE n');

        // 2. Create All Nodes First
        console.log('Creating Nodes...');
        await runQuery(`
            // Chemicals (10)
            CREATE (:AgriChemical {batch_id: 'CHEM-BKN-001', type: 'Fertilizer', manufacturer: 'AgriGrow Solutions', product_name: 'Ammonium Sulfate (21-0-0)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-MIS-002', type: 'Fertilizer', manufacturer: 'BioShield Inc', product_name: 'Potassium Chloride (0-0-60)', status: 'RECALLED'})
            CREATE (:AgriChemical {batch_id: 'CHEM-BKN-003', type: 'Fertilizer', manufacturer: 'Local Salt Co', product_name: 'Common Salt (NaCl)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-PEST-004', type: 'Fungicide', manufacturer: 'Sharphil Inc', product_name: 'Azoxystrobin (Zoxy 250 SC)', status: 'RECALLED'})
            CREATE (:AgriChemical {batch_id: 'CHEM-PEST-005', type: 'Insecticide', manufacturer: 'Link Agritech', product_name: 'Diazinon (Zenon)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-UREA-006', type: 'Fertilizer', manufacturer: 'Fertilizer Corp Phil', product_name: 'Urea (46-0-0)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-COMP-007', type: 'Fertilizer', manufacturer: 'Atlas Fertilizer', product_name: 'Complete (14-14-14)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-GLY-008', type: 'Herbicide', manufacturer: 'Monsanto/Bayer', product_name: 'Glyphosate (Roundup)', status: 'OK'})
            CREATE (:AgriChemical {batch_id: 'CHEM-MAN-009', type: 'Fungicide', manufacturer: 'Dow AgroSciences', product_name: 'Mancozeb (Dithane)', status: 'RECALLED'})
            CREATE (:AgriChemical {batch_id: 'CHEM-CHL-010', type: 'Insecticide', manufacturer: 'Global Chem', product_name: 'Chlorpyrifos', status: 'OK'})

            // Farms (15)
            CREATE (:Farm {farm_id: 'FARM-LDN-BARCOCO', owner_name: 'BARCOCO Bualan Co-op', location: 'Tubod, Lanao del Norte'})
            CREATE (:Farm {farm_id: 'FARM-LDN-SIMBUCO', owner_name: 'Simbuco Aqua-Marine Co-op', location: 'Kolambugan, Lanao del Norte'})
            CREATE (:Farm {farm_id: 'FARM-LDN-LASEMCO', owner_name: 'LASEMCO Seed Growers', location: 'Kapatagan, Lanao del Norte'})
            CREATE (:Farm {farm_id: 'FARM-MIS-CLAVERIA', owner_name: 'Claveria Vegetable Co-op', location: 'Claveria, Misamis Oriental'})
            CREATE (:Farm {farm_id: 'FARM-MIS-DAIRY', owner_name: 'NorMin Dairy Federation', location: 'El Salvador, Misamis Oriental'})
            CREATE (:Farm {farm_id: 'FARM-MIS-KAMADA', owner_name: 'KAMADA ARC Cooperative', location: 'Balingoan, Misamis Oriental'})
            CREATE (:Farm {farm_id: 'FARM-BKN-MANOLO', owner_name: 'Manolo Fortich Highland Farm', location: 'Manolo Fortich, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-COPOMA', owner_name: 'CoPoMa (Cooperatiba sa Pobreng Mag-uuma)', location: 'Lantapan, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-SUMILAO', owner_name: 'Panaw Sumilao Multi-Purpose Cooperative', location: 'Sumilao, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-TALAKAG', owner_name: 'Miarayon Highland Farm', location: 'Talakag, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-VALENCIA', owner_name: 'Valencia Rice/Corn Estates', location: 'Valencia City, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-BUSGA', owner_name: 'BUSGA Producers Co-op', location: 'Malaybalay City, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-BFACO', owner_name: 'Bukidnon Farmers Agri Co-op (BFACO)', location: 'Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-BKN-TALAHIRON', owner_name: 'Talahiron Multi-Purpose Co-op', location: 'Dangcagan, Bukidnon'})
            CREATE (:Farm {farm_id: 'FARM-ILG-IZON', owner_name: 'Izon Highland Farm', location: 'Pala-o, Iligan City'})

            // Markets (15 Iligan City Markets)
            CREATE (:RetailMarket {market_id: 'MKT-ILG-PALAO', name: 'Pala-o Central Market', address: 'Pala-o, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-TAMBO', name: 'Tambo Public Market', address: 'Tambo, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-ROB', name: 'Robinsons Place Iligan', address: 'Macapagal Ave, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-GAISANO', name: 'Gaisano Mall Iligan', address: 'Pala-o, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-EMILIA', name: 'Emilia Supermarket', address: 'Gen. Aguinaldo St, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-FIESTA', name: 'Fiesta Mall (Tubod)', address: 'Tubod, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-FK', name: 'FK Supermarket', address: 'Aguinaldo Ext, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-BOHOL', name: 'Iligan Bohol Trading', address: 'Aguinaldo Ext, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-GOLDEN', name: 'Golden Dragon Supermarket', address: 'Pala-o, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-HONAS', name: 'Hona Supermarket', address: 'Pala-o, Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-NIMROD', name: 'Nimrod Store', address: 'Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-NAIDZ', name: 'Naidz Store', address: 'Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-GENELEEN', name: 'Geneleen Bakery & Grocery', address: 'Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-DOWNTOWN', name: 'Downtown Grocery', address: 'Iligan City'})
            CREATE (:RetailMarket {market_id: 'MKT-ILG-GALAXY', name: 'Iligan Galaxy Merchandising', address: 'Iligan City'})

            // Processing Facilities (5)
            CREATE (:ProcessingFacility {facility_id: 'PROC-TAG-GARDENIA', name: 'Gardenia Bread Plant', location: 'PHIVIDEC, Tagoloan', type: 'Bakery Manufacturing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-TAG-OISHI', name: 'Liwayway (Oishi) Plant', location: 'PHIVIDEC, Tagoloan', type: 'Snack Food Processing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-BKN-HUB', name: 'Bukidnon Food Hub', location: 'Manolo Fortich', type: 'Agri-Logistics & Processing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-LDN-MILK', name: 'SND Milk Processing Plant', location: 'LDN', type: 'Dairy Processing'})
            CREATE (:ProcessingFacility {facility_id: 'PROC-ILG-KAPE', name: 'Agri-Rainbow Coffee Plant', location: 'Iligan City', type: 'Coffee & Spice Processing'})
        `);

        const farmIds = [
            'FARM-LDN-BARCOCO', 'FARM-LDN-SIMBUCO', 'FARM-LDN-LASEMCO', 'FARM-MIS-CLAVERIA',
            'FARM-MIS-DAIRY', 'FARM-MIS-KAMADA', 'FARM-BKN-MANOLO', 'FARM-BKN-COPOMA',
            'FARM-BKN-SUMILAO', 'FARM-BKN-TALAKAG', 'FARM-BKN-VALENCIA', 'FARM-BKN-BUSGA',
            'FARM-BKN-BFACO', 'FARM-BKN-TALAHIRON', 'FARM-ILG-IZON'
        ];

        const marketIds = [
            'MKT-ILG-PALAO', 'MKT-ILG-TAMBO', 'MKT-ILG-ROB', 'MKT-ILG-GAISANO', 'MKT-ILG-EMILIA',
            'MKT-ILG-FIESTA', 'MKT-ILG-FK', 'MKT-ILG-BOHOL', 'MKT-ILG-GOLDEN', 'MKT-ILG-HONAS',
            'MKT-ILG-NIMROD', 'MKT-ILG-NAIDZ', 'MKT-ILG-GENELEEN', 'MKT-ILG-DOWNTOWN', 'MKT-ILG-GALAXY'
        ];

        const facilityIds = [
            'PROC-TAG-GARDENIA', 'PROC-TAG-OISHI', 'PROC-BKN-HUB', 'PROC-LDN-MILK', 'PROC-ILG-KAPE'
        ];

        const crops = ['Saba Banana', 'Coconut', 'Yellow Corn', 'Fresh Milk', 'Carrots', 'Rice', 'Coffee', 'Cassava', 'Vegetables', 'Pineapple'];

        // 3. Create Crop Batches and Link to Unique Markets
        console.log('Generating 75 Crop Batches with Diversified Distribution...');
        for (let f = 0; f < farmIds.length; f++) {
            const farmId = farmIds[f];
            for (let i = 0; i < 5; i++) {
                const date = `2026-05-${String(9 + i).padStart(2, '0')}`;
                const batchId = `BATCH-${farmId.split('-')[2]}-${i + 1}`;
                const cropType = crops[Math.floor(Math.random() * crops.length)];
                
                // Select a unique market for this batch
                const marketId = marketIds[(f + i) % marketIds.length];
                const facilityId = facilityIds[(f + i) % facilityIds.length];

                // Simplified Cypher without conditional CALL { UNION } inside loop
                if (i % 2 === 0) {
                    // Via Processing
                    await runQuery(`
                        MATCH (f:Farm {farm_id: $farmId}), (m:RetailMarket {market_id: $marketId}), (p:ProcessingFacility {facility_id: $facilityId})
                        CREATE (b:CropBatch {batch_id: $batchId, crop_type: $cropType, harvest_date: $date})
                        CREATE (f)-[:PRODUCED]->(b)
                        CREATE (b)-[:PROCESSED_AT]->(p)
                        CREATE (p)-[:DISTRIBUTED_TO]->(m)
                    `, { farmId, batchId, cropType, date, marketId, facilityId });
                } else {
                    // Direct to Market
                    await runQuery(`
                        MATCH (f:Farm {farm_id: $farmId}), (m:RetailMarket {market_id: $marketId})
                        CREATE (b:CropBatch {batch_id: $batchId, crop_type: $cropType, harvest_date: $date})
                        CREATE (f)-[:PRODUCED]->(b)
                        CREATE (b)-[:DISTRIBUTED_TO]->(m)
                    `, { farmId, batchId, cropType, date, marketId });
                }
            }
        }

        // 4. Apply Chemicals to Farms
        console.log('Applying Chemicals to Farms...');
        const chemicalIds = [
            'CHEM-BKN-001', 'CHEM-MIS-002', 'CHEM-BKN-003', 'CHEM-PEST-004', 'CHEM-PEST-005',
            'CHEM-UREA-006', 'CHEM-COMP-007', 'CHEM-GLY-008', 'CHEM-MAN-009', 'CHEM-CHL-010'
        ];

        for (let i = 0; i < chemicalIds.length; i++) {
            const chemId = chemicalIds[i];
            const farmId = farmIds[i % farmIds.length];
            await runQuery(`
                MATCH (c:AgriChemical {batch_id: $chemId}), (f:Farm {farm_id: $farmId})
                CREATE (f)-[:APPLIED]->(c)
            `, { chemId, farmId });
        }

        // Ensure every farm has at least one chemical applied for trace testing
        for (let i = chemicalIds.length; i < farmIds.length; i++) {
            const farmId = farmIds[i];
            const chemId = chemicalIds[i % chemicalIds.length];
            await runQuery(`
                MATCH (c:AgriChemical {batch_id: $chemId}), (f:Farm {farm_id: $farmId})
                CREATE (f)-[:APPLIED]->(c)
            `, { chemId, farmId });
        }

        console.log('--- Diversified Dataset Seeding Completed Successfully ---');
    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await driver.close();
        process.exit();
    }
};

seedData();
