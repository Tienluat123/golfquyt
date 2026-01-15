const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET http://localhost:5001/sessions
router.get('/', authMiddleware, sessionController.getMySessions);

module.exports = router;
