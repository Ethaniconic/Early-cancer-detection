const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imagePath: {
        type: String
    },
    biomarkers: {
        type: Object,
        default: {}
    },
    history: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    riskScore: {
        type: Number
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High']
    },
    heatmapPath: {
        type: String
    },
    biomarkerContributions: {
        type: Array,
        default: []
    },
    historyContributions: {
        type: Array,
        default: []
    },
    aiInsight: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);
