const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');



// POST http://localhost:5001/auth/register
router.post('/register', authController.register);


// POST http://localhost:5001/auth/login
router.post('/login', authController.login);

module.exports = router;
