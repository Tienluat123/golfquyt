// src/controllers/course.controller.js
const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Lấy tất cả course (sau này có thể filter theo level user)
        const courses = await Course.find()
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        console.log(`[GET /courses/:id] Requested ID: ${req.params.id}`);
        const course = await Course.findById(req.params.id);
        if (!course) {
            console.log(`[GET /courses/:id] Course not found in DB`);
            return res.status(404).json({ message: `Course not found for ID: ${req.params.id}` });
        }
        console.log(`[GET /courses/:id] Found course: ${course.title}`);
        res.json(course);
    } catch (error) {
        console.error(`[GET /courses/:id] Error:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: "Course not found (Invalid ID)" });
        }
        res.status(500).json({ message: error.message });
    }
};
