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
