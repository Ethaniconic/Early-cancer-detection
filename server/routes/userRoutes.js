const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getRecentUsers, updateProfile } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/recent', getRecentUsers);
router.post('/profile/update', updateProfile);

module.exports = router;