# Changelog

## [2026-02-19 10:45 AM]

### ADDED
- New attribute: **Age** (Numeric field).
- New attribute: **Networth** (Numeric field with currency formatting).
- Form validation for numeric inputs in the frontend.
- Currency formatting (PHP) for the Networth display in the student table.
- `README.md` with project setup instructions.
- `PROJECT_OVERVIEW.md` explaining the architecture.

### FIXED
- Backend `validateStudent` middleware to include mandatory checks for Age and Networth.
- `studentController.js` logic to ensure Age and Networth are persisted in Redis hashes.
- Frontend `app.js` logic to correctly map the new fields during Create, Update, and Edit operations.
