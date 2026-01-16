const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, sessionController.getMySessions);
router.post('/', authMiddleware, sessionController.createSession);

// GET http://localhost:5001/sessions/:id  -> Chi tiết 1 session (có populate analyses)
router.get('/:id', authMiddleware, sessionController.getSessionById);


module.exports = router;
