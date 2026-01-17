const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const protect = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', chatbotController.sendMessage);

// GET /api/chatbot/context - Get user context (for debugging)
router.get('/context', chatbotController.getUserContext);

module.exports = router;
