# AgriChain: Project Overview & Context

## The What
AgriChain is a graph-driven, farm-to-table traceability and threat intelligence web application. It models the agricultural economy of Northern Mindanao (tracking commodities like Saba bananas and coconuts) as a living web rather than a static list of transactions.

It tracks:
1. Physical movement of crops from specific farm lots to retail markets.
2. Inputs like fertilizer and pesticide batches applied to farm lots.

### The Core Deliverable
A "Contamination Blast Radius" tool. If a chemical batch is found toxic, the system traces it through the entire supply chain to output a definitive list of retail markets requiring an immediate recall.

## The Why: The Neo4j Justification
When compared to traditional SQL, Neo4j offers significant advantages for this use case:

### The SQL Nightmare (Recursive CTEs)
In SQL, tracing a toxic fertilizer requires multiple complex joins (Chemicals -> Farms -> Harvests -> Processors -> Markets). If data branches, recursive CTEs are required. These are:
- Computationally heavy.
- Difficult to maintain (hundreds of lines of code).
- Slower as the database grows due to read-time relationship computation.

### The Graph Advantage (Index-Free Adjacency)
Neo4j uses index-free adjacency. Relationships are physically stored as pointers on disk.
- **Speed:** Traversal takes milliseconds even at scale.
- **Simplicity:** Pathfinding queries are intuitive and concise.

## Data Model (Nodes & Relationships)

### Nodes
- **AgriChemical:** batch_id, type, manufacturer, status
- **Farm:** farm_id, owner_name, location_coordinates
- **CropBatch:** batch_id, crop_type, harvest_date
- **ProcessingFacility:** facility_id, name, type
- **RetailMarket:** market_id, name, address

### Relationships
- `(Farm)-[:APPLIED {date_applied}]->(AgriChemical)`
- `(Farm)-[:PRODUCED]->(CropBatch)`
- `(CropBatch)-[:PROCESSED_AT {arrival_date}]->(ProcessingFacility)`
- `(ProcessingFacility)-[:DISTRIBUTED_TO {delivery_date}]->(RetailMarket)`
