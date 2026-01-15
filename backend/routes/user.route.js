const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET http://localhost:5001/users/me
router.get('/me', authMiddleware, userController.getMe);


module.exports = router;
