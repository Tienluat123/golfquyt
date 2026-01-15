const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  // Liên kết ngược về Session và User
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Video
  originalVideoUrl: { type: String },   // Video gốc
  processedVideoUrl: { type: String },  // Video AI đã vẽ xương
  
  // Các chỉ số AI trả về (Lưu dạng Object cho linh hoạt)
  metrics: {
    score: { type: Number, default: 0 },
    band: { type: String },
    swingSpeed: { type: Number },
    wristRotation: { type: Number },
    hipRotation: { type: Number },
    tempo: { type: Number } // Ví dụ thêm: nhịp điệu
  },

  // Lời khuyên
  aiAdvice: { type: String },
  
  // Trạng thái xử lý (để Frontend biết mà hiện loading)
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);
