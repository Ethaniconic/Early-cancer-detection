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
    // Doctor-specific identifier
    licenseNumber: {
        type: String,
        trim: true,
        sparse: true
    },
    // Admin-specific identifier
    adminId: {
        type: String,
        trim: true,
        sparse: true
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;