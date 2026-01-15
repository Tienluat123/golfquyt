const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  
  // Danh sách các bài học nhỏ/checklist
  checklist: [{
    stepName: String,
    description: String,
    instructionVideoUrl: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
