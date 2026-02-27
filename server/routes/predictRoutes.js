const express = require('express');
const router = express.Router();
const { predictBiomarkers, extractBiomarkers, recommendDoctors } = require('../controllers/predictController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// The route will be mounted at /api/predict
router.post('/biomarkers', predictBiomarkers);
router.post('/extract', upload.single('report'), extractBiomarkers);
router.post('/recommend-doctors', recommendDoctors);

module.exports = router;
