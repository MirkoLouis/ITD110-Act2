# Commit Document

## Proposed Commit Message
Implemented Year Level attribute and synchronized Vanilla and React frontends.
Added 6th attribute (Year Level), converted Course to dropdown, and polished React UI with animations and icons.

## Changes Summary
- **Backend:** Updated validation and controller to support `yearLevel`.
- **Frontend (Vanilla):** Added Year Level dropdown, updated table, and maintained original full-width layout.
- **Frontend (React):** 
    - Added Year Level dropdown and 4-column grid layout for secondary fields.
    - Integrated `lucide-react` icons and `framer-motion` animations.
    - Added `react-hot-toast` for modern notifications.
- **Documentation:** Updated `CHANGELOG.md`, `PROJECT_OVERVIEW.md`, and `README.md` to reflect the 6-attribute system and dual frontend options.
- **Cleanup:** Removed all "Address" field remnants from code and UI.
