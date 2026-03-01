const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { name, mobile, age, password, role, licenseNumber, specialization, hospital, adminId, department } = req.body;

        if (!name || !password || !role) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        // Role-specific validation and duplicate check
        let query = {};
        let userData = { name, password, role };

        if (role === 'user') {
            if (!mobile || !age) {
                return res.status(400).json({ message: 'Mobile number and age are required for patients.' });
            }
            query = { mobile };
            userData = { ...userData, mobile, age };
        } else if (role === 'doctor') {
            if (!licenseNumber || !mobile) {
                return res.status(400).json({ message: 'License number and mobile are required for doctors.' });
            }
            query = { licenseNumber };
            userData = { ...userData, licenseNumber, mobile, specialization, hospital };
        } else if (role === 'admin') {
            if (!adminId || !mobile) {
                return res.status(400).json({ message: 'Admin ID and mobile are required for admins.' });
            }
            query = { adminId };
            userData = { ...userData, adminId, mobile, department };
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        // Check for duplicates
        const userExists = await User.findOne(query);
        if (userExists) {
            return res.status(400).json({ message: 'A user with this identifier already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(password, salt);

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                message: 'User registered successfully',
                user: { _id: user._id, name: user.name, role: user.role }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { role, password, mobile, licenseNumber, adminId } = req.body;

        if (!role || !password) {
            return res.status(400).json({ message: 'Role and password are required.' });
        }

        let user = null;
        let invalidMsg = '';

        if (role === 'user') {
            if (!mobile) return res.status(400).json({ message: 'Mobile number is required for patient login.' });
            user = await User.findOne({ mobile, role: 'user' });
            invalidMsg = 'Invalid mobile number or password.';
        } else if (role === 'doctor') {
            if (!licenseNumber) return res.status(400).json({ message: 'License number is required for doctor login.' });
            user = await User.findOne({ licenseNumber, role: 'doctor' });
            invalidMsg = 'Invalid license number or password.';
        } else if (role === 'admin') {
            if (!adminId) return res.status(400).json({ message: 'Admin ID is required for admin login.' });
            user = await User.findOne({ adminId, role: 'admin' });
            invalidMsg = 'Invalid admin ID or password.';
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                message: 'Login successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    role: user.role,
                    profileComplete: user.profileComplete || false,
                    targetCancer: user.targetCancer || '',
                    isVerified: user.isVerified || false,
                    specialization: user.specialization || ''
                },
                token
            });
        } else {
            res.status(401).json({ message: invalidMsg });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized.' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { targetCancer, bloodGroup, currentMedications, pastSurgeries, knownAllergies, familyHistory, currentSymptoms } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { $set: { targetCancer, bloodGroup, currentMedications, pastSurgeries, knownAllergies, familyHistory, currentSymptoms, profileComplete: true } },
            { new: true, select: '-password' }
        );

        if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

        res.json({ message: 'Profile updated successfully.', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getRecentUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 }).limit(10).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

const verifyDoctor = async (req, res) => {
    try {
        const { specialization } = req.body;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified: true, specialization },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, getRecentUsers, updateProfile, verifyDoctor };