const express = require('express');
const router = express.Router();
const { predictBiomarkers } = require('../controllers/predictController');

// The route will be mounted at /api/predict
router.post('/biomarkers', predictBiomarkers);

module.exports = router;
