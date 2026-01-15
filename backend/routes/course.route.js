const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET http://localhost:5001/courses
router.get('/', authMiddleware, courseController.getCourses);

module.exports = router;
