# Changelog

All notable changes to this project will be documented in this file.

## [0.8.1-Alpha+202605091800] - 2026-05-09

### ADDED
- **Graph Restore Feature:** Users can now upload a previously exported AgriChain JSON backup to fully restore the graph database.
- **Robust Export Engine:** Optimized the JSON export logic to include distinct nodes and relationships with stable internal ID mapping for seamless restoration.
- **Restoration UI:** Added a file upload component and success feedback to the main dashboard.

## [0.8.0-Alpha+202605091730] - 2026-05-09

### ADDED
- **Multi-Tier Traceability:** Introduced `RawMaterial` (Tier 3) nodes to track industrial ingredients supplied to chemical manufacturers.
- **Affected Area Analysis:** Rebranded "Blast Radius" to "Affected Area" for professional clarity.
- **Deep Lineage Summary:** The trace dashboard now displays industrial raw materials for each chemical batch.
- **Vision Overhaul:** Major documentation rewrite incorporating the project's strategic identity and Neo4j performance justification.

### FIXED
- **Homepage Consolidation:** Chemical Management is now served directly at the root URL (`/`).
- **Route Optimization:** Removed redundant `/chemicals` route and updated all CRUD redirects.

## [0.7.0-Alpha+202605091700] - 2026-05-09

### ADDED
- **Alternative Sourcing Engine:** The system now proactively recommends safe, alternative farm sources for markets affected by a chemical recall.
- **Intelligent Pattern Matching:** Leverages Neo4j's `shortestPath` and exclusionary filtering to ensure suggested farms are free from contamination.
- **Refined Data Context:** Granular crop type specification (e.g., Pechay, Tomato, Eggplant) replacing generic categories for more precise alternative sourcing.
- **Enhanced Trace Results UI:** New visualization for "Safe Alternatives" within the lineage analysis dashboard.

## [0.6.0-Alpha+202605091630] - 2026-05-09

### ADDED
- Massive dataset expansion:
    - 10 Realistic AgriChemicals (Fertilizers, Pesticides, Herbicides).
    - 15 Unique Retail Markets in Iligan City (Public markets, Supermarkets, and local stores).
    - 15 Farms and Cooperatives across Northern Mindanao (Bukidnon, Misamis Oriental, Lanao del Norte).
    - 75 Crop Batches (5 batches per farm) spanning 5 days from 2026-05-09 to 2026-05-13.
- Verified 100% path connectivity: Every chemical batch is linked to at least one farm, and every farm's crops are traced to a market.
- Diversified Distribution: Each farm now distributes its 5 crop batches to 5 unique retail markets, creating a more realistic "Blast Radius" effect for trace analysis.
- Real-world data integration for improved authenticity and testing robustness.

## [0.5.0-Alpha+202605091605] - 2026-05-09

### ADDED
- Hot-reloading support via `nodemon` for improved development workflow.

### FIXED
- Redundant 'Quick Trace' section removed from Chemical Management dashboard for a cleaner UI.
- Footer layout converted to sticky to ensure it remains at the bottom of the viewport.
- Dedicated professional styling for the footer to improve visual hierarchy and separation.

### FIXED
- Chemical node label visibility: Changed font color from white to dark grey (#212121) so text is visible against the white dashboard background.

## [0.4.3-Alpha+202605071700] - 2026-05-07

### ADDED
- Massive dataset expansion including Iligan City locations (Pala-o Market, Tambo Market, Robinsons Iligan).
- Enriched farm list with Lanao del Norte cooperatives (BARCOCO, SND Dairy).
- 100% Connectivity: Every chemical batch now has a verified multi-node supply chain path.
- Reliable Seeding: Separated path creation into independent queries to avoid Cypher variable shadowing.
- Verified 100% path connectivity across all chemical batches.
- Set Chemical Management (/chemicals) as the official homepage.
- Cleaned up obsolete `index.hbs` after migrating the homepage to the management dashboard.

### FIXED
- Confirmed seeder uses `DETACH DELETE` to prevent data interference.
- Resolved "Single Node" visualization issue by ensuring all seeded chemicals have relationships.
- Redundant navigation links removed from the management view.

## [0.4.2-Alpha+202605071630] - 2026-05-07


### FIXED
- JavaScript `SyntaxError` in `graph.js` caused by invalid escape sequences.
- Updated navigation labels in chemical management for better clarity.

## [0.4.1-Alpha+202605071600] - 2026-05-07

### ADDED
- Consolidated Trace form into the Chemical Management dashboard for better UX.
- Direct "Trace Path" buttons in the chemical inventory table.
- Lineage visualization for "OK" chemicals (Safe paths).

### FIXED
- Empty graph visualization for `CHEM-PEST-004` and `CHEM-PEST-005` by establishing missing seed relationships.
- Restricted trace logic: Now shows lineage for all batches but highlights contamination status.

## [0.4.0-Alpha+202605071500] - 2026-05-07

### ADDED
- Enriched seed data with realistic Northern Mindanao agricultural locations (Manolo Fortich, Claveria, Tagoloan).
- Real-world fertilizers and pesticides (Ammonium Sulfate, Potassium Chloride, Common Salt, Azoxystrobin, Diazinon).
- Integration of major industrial players (Gardenia, Liwayway/Oishi, Bukidnon Food Hub).
- Logging for backend routes to aid debugging.

### FIXED
- Surgical rewrite of `app.js` to fix the `/chemicals` routing issue.

## [0.3.0-Alpha+202605071400] - 2026-05-07

### ADDED
- Full CRUD operations for AgriChemicals (Create, Read, Update, Delete).
- JSON Backup feature (downloadable graph export).
- Handlebars `eq` helper for conditional rendering.
- Data Management dashboard.
- Interactive graph visualization using `vis-network`.
- Color-coded nodes (Red for contaminated chemicals, Green for farms/crops).
- Dynamic subgraph loading for contamination paths.
- Final CSS styling for professional UI.

### FIXED
- Fulfilled missing requirements from Case Study #2 (Backup & CRUD).

## [0.2.0-Alpha+202605071200] - 2026-05-07

### ADDED
- Express server setup with Handlebars templating.
- Neo4j driver integration and `db.js` utility.
- Database seeding script with Northern Mindanao specific data.
- "Blast Radius" Cypher query implementation.
- `/trace` route and results visualization page.
- Initial CSS variable-based green theme.

### FIXED
- (N/A)

## [0.1.0-Alpha+202605071100] - 2026-05-07

### ADDED
- Initial project initialization with `npm init`.
- Comprehensive `README.md` with setup instructions.
- `PROJECT_OVERVIEW.md` detailing the graph-driven architecture and Neo4j justification.
- Project structure planning.
