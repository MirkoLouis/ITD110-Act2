const express = require('express');
const router = express.Router();
const {
    importDataset,
    getRegions,
    getByRegion,
    getOne,
    createOne,
    updateOne,
    deleteOne,
} = require('../controllers/povertyController');

// POST /api/poverty/import — bulk import CSV
router.post('/import', importDataset);

// GET /api/poverty/regions — list all distinct regions
router.get('/regions', getRegions);

// POST /api/poverty — create a single data point
router.post('/', createOne);

// GET /api/poverty/:region — all years for a region
router.get('/:region', getByRegion);

// GET /api/poverty/:region/:age_group/:year — single data point
router.get('/:region/:age_group/:year', getOne);

// PUT /api/poverty/:region/:age_group/:year — update
router.put('/:region/:age_group/:year', updateOne);

// DELETE /api/poverty/:region/:age_group/:year — delete
router.delete('/:region/:age_group/:year', deleteOne);

module.exports = router;
