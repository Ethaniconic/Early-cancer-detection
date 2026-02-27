const express = require('express');
const {
    createAssessment,
    getAssessmentById,
    getPatientAssessments,
    deleteAssessment
} = require('../controllers/assessmentController');
const upload = require('../middleware/upload');

const router = express.Router();

router
    .route('/')
    .post(upload.single('image'), createAssessment);

router
    .route('/:id')
    .get(getAssessmentById)
    .delete(deleteAssessment);

router
    .route('/patient/:patientId')
    .get(getPatientAssessments);

module.exports = router;
