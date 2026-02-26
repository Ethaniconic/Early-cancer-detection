const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController')

router.get('/login', registerUser);

module.exports = router;