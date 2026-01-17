const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    thumbnailUrl: { type: String },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },

    // Danh sách các bài học nhỏ/checklist
    // Danh sách các bài học nhỏ/checklist (Preview)
    checklist: [{
        stepName: String,
        description: String,
        instructionVideoUrl: String
    }],

    category: { type: String }, // e.g. "Setup · Beginner"
    duration: { type: String }, // e.g. "12 min"
    lessonCount: { type: Number },

    // Các bước tập luyện (Camera AI)
    trainingSteps: [{
        stepIndex: Number,
        title: String,
        instruction: String,
        visualGuide: String,
        userAction: String,
        order: Number,
        // Criteria để chấm điểm tự động
        criteria: {
            type: { type: String }, // "angle", "position", "alignment"
            keyPoints: [String], // ["leftHip", "leftKnee", "leftAnkle"]
            min: Number,
            max: Number,
            holdDuration: { type: Number, default: 2000 }
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
