const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const analyzeController = require('../controllers/analysis.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', upload.single('file'), authMiddleware, analyzeController.analyzeVideo);
router.get('/:id', authMiddleware, analyzeController.getAnalysisDetail);


module.exports = router;
