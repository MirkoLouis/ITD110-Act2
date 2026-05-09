# AgriChain: Supply Chain Threat Intelligence

## The Vision
AgriChain is a **Supply Chain Threat Intelligence Platform** designed to solve the "Black Box" problem in food safety. In modern agriculture, traceability is often fragmented; if a consumer gets sick from a tomato in Iligan City, identifying the root cause—whether it was the farm, the pesticide, or the specific crop batch—is traditionally a massive data challenge.

AgriChain provides **Total Visibility** by modeling the entire agricultural economy of Northern Mindanao as a living, interconnected graph.

## The Problem: The "Black Box"
Traditional supply chain systems rely on Relational Databases (SQL). When a contamination event occurs, tracing a path through multiple steps (Chemicals -> Farms -> Processors -> Markets) requires deep, recursive joins. 

**Why SQL Struggles:** 
In SQL, data lives in separate tables. To trace a path, the database must perform a "JOIN" at query time. Computing these connections "on the fly" across millions of rows takes immense processing power. Deep chains require complex "Recursive CTEs" that exponentially slow down the server. It's like having to read the entire city map at every single intersection.

## The Solution: The Graph Advantage
**Why Neo4j Wins:**
Neo4j uses **Index-Free Adjacency**. Relationships are not computed at query time; they are physically stored as direct memory pointers on the hard drive the moment the data is saved. To trace a toxic crop to its destination, Neo4j simply follows the pre-existing pointers. It's like having a physical string tied between every connected point—you just pull the string. Tracing takes milliseconds, regardless of database size.

## Core Capabilities
1.  **Direct Traceability:** Track agricultural products from chemical application at the farm to the retail market shelf.
2.  **Affected Area Analysis:** Instantly visualize the "Impact Zone" of a contamination event, identifying every retail market requiring a recall.
3.  **Resilience Engine:** Automatically recommend safe, alternative farm sources for specific crops during a crisis to stabilize regional food security.

## Data Model

### Nodes
- **AgriChemical:** batch_id, product_name, manufacturer, status
- **Farm:** farm_id, owner_name, location
- **CropBatch:** batch_id, crop_type, harvest_date
- **ProcessingFacility:** facility_id, name, type
- **RetailMarket:** market_id, name, address

### Relationships
- `(Farm)-[:APPLIED]->(AgriChemical)`
- `(Farm)-[:PRODUCED]->(CropBatch)`
- `(CropBatch)-[:PROCESSED_AT]->(ProcessingFacility)`
- `(CropBatch)-[:DISTRIBUTED_TO]->(RetailMarket)`
- `(ProcessingFacility)-[:DISTRIBUTED_TO]->(RetailMarket)`
