## 2026-05-07 20:20

- Version: 1.0.0-Beta+202605072020

### ADDED
- Migrated application from SDG 7 (Electricity) to SDG 1 (Poverty Statistics).
- Implemented SDG 1.2.1 dataset support with "Age Group" dimension.
- Updated Cassandra schema to `poverty_by_age_group` with composite primary key.
- Modernized UI with SDG 1 Red theme and responsive layout.
- Added README.md with project documentation and setup guides.

### FIXED
- Resolved backend startup issues by installing missing dependencies.

## 2026-05-07 20:27

- Version: 1.1.0-Beta+202605072027

### ADDED
- Implemented "Clear All Data" functionality (TRUNCATE) in the backend.
- Added "Clear All Data" button to the frontend UI for manual resets.
- Added "Clear existing data before import" checkbox to the import workflow.
- Updated import logic to support optional table truncation before bulk insertion.

### FIXED
- Fixed ReferenceError in `povertyRoutes.js` by correctly destructuring the `clearAll` controller.
