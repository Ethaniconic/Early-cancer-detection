const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController')

router.get('/', registerUser);

module.exports = router;