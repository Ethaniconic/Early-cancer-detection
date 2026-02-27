const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        trim: true,
        sparse: true,
    },
    age: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'doctor'],
        default: 'user'
    },
    // Patient Profile Completion Fields
    profileComplete: {
        type: Boolean,
        default: false
    },
    targetCancer: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    currentMedications: { type: String, trim: true },
    pastSurgeries: { type: String, trim: true },
    knownAllergies: { type: String, trim: true },
    familyHistory: { type: String, trim: true },
    currentSymptoms: { type: String, trim: true },
    // Doctor-specific identifier
    licenseNumber: {
        type: String,
        trim: true,
        sparse: true
    },
    specialization: {
        type: String,
        trim: true
    },
    hospital: {
        type: String,
        trim: true
    },
    // Admin-specific identifier
    adminId: {
        type: String,
        trim: true,
        sparse: true
    },
    department: {
        type: String,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;