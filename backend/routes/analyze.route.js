const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const analyzeController = require('../controllers/analysis.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/analyze', upload.single('file'), analyzeController.analyzeVideo);

module.exports = router;
