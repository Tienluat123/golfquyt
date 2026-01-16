const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true }, // Nên có required
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  originalVideoUrl: { type: String },
  processedVideoUrl: { type: String },
  
  // Thêm cái này: Ảnh thumbnail của riêng cú đánh này (để hiện trong list)
  thumbnailUrl: { type: String }, 

  metrics: {
    score: { type: Number, default: 0 },
    band: { type: String },
    swing_speed: { type: Number }, // Lưu ý: Python dùng snake_case (gạch dưới)
    arm_angle: { type: Number },
    hip_rotation: { type: Number },
    wrist_cock: { type: Number },
    tempo: { type: Number }
  },

  aiAdvice: { type: String },
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);
