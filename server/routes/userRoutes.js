const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getRecentUsers, updateProfile, verifyDoctor } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/recent', getRecentUsers);
router.post('/profile/update', updateProfile);
router.post('/verify-doctor', protect, verifyDoctor);

module.exports = router;