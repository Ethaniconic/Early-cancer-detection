const Assessment = require('../models/Assessment');
const { runInference } = require('../services/mlService');
const logger = require('../utils/logger');

// @desc    Create new assessment and trigger inference
// @route   POST /api/assessments
// @access  Private 
exports.createAssessment = async (req, res, next) => {
    try {
        const { patientId, biomarkers, history } = req.body;

        let parsedBiomarkers = biomarkers ? JSON.parse(biomarkers) : {};
        let parsedHistory = history ? JSON.parse(history) : {};

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        // 1. Save pending assessment
        let assessment = await Assessment.create({
            patientId,
            imagePath,
            biomarkers: parsedBiomarkers,
            history: parsedHistory,
            status: 'processing'
        });

        logger.info(`Assessment ${assessment._id} created via inference engine`);

        // 2. Prepare payload for Python ML service
        const mlPayload = {
            assessmentId: assessment._id,
            patientId: patientId,
            imagePath: imagePath,
            biomarkers: parsedBiomarkers,
            history: parsedHistory
        };

        // 3. Call ML Service
        try {
            const mlResult = await runInference(mlPayload);

            // 4. Update assessment with results
            assessment = await Assessment.findByIdAndUpdate(assessment._id, {
                status: 'completed',
                riskScore: mlResult.riskScore,
                riskLevel: mlResult.riskLevel,
                heatmapPath: mlResult.heatmapPath,
                biomarkerContributions: mlResult.biomarkerContributions,
                historyContributions: mlResult.historyContributions
            }, { new: true });

            res.status(201).json({ success: true, data: assessment });

        } catch (mlError) {
            // Handle ML Service Failure
            assessment.status = 'failed';
            await assessment.save();
            return res.status(503).json({ success: false, error: mlError.message });
        }

    } catch (err) {
        next(err);
    }
};

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessmentById = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id).populate('patientId', 'name age sex');
        if (!assessment) {
            return res.status(404).json({ success: false, error: 'Assessment not found' });
        }
        res.status(200).json({ success: true, data: assessment });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all assessments for a patient
// @route   GET /api/assessments/patient/:patientId
// @access  Private
exports.getPatientAssessments = async (req, res, next) => {
    try {
        const assessments = await Assessment.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: assessments.length, data: assessments });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private
exports.deleteAssessment = async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ success: false, error: 'Assessment not found' });
        }
        await assessment.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
