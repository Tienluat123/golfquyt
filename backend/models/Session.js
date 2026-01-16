const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: "Indoor Arena" },
  location: { type: String },
  date: { type: Date, default: Date.now },
  
  // --- CÁC TRƯỜNG CẦN THÊM ---
  
  // 1. Lưu lời khuyên tổng hợp của AI cho cả buổi
  aiSummary: { type: String, default: "Chưa có nhận xét tổng quan." },
  
  // 2. Lưu số lượng video để hiển thị nhanh ngoài Dashboard (VD: "5 videos")
  videoCount: { type: Number, default: 0 },

  // Kết quả tổng quan
  overallScore: { type: Number, default: 0 },
  overallBand: { type: String, default: "N/A" },
  thumbnailUrl: { type: String }
}, { 
  timestamps: true,
  // 3. QUAN TRỌNG: Bật tính năng Virtuals để link sang bảng Analysis
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- THIẾT LẬP LIÊN KẾT ẢO (VIRTUAL POPULATE) ---
// Giúp: Session.find().populate('analyses') hoạt động
SessionSchema.virtual('analyses', {
  ref: 'Analysis',       // Link tới Model Analysis
  localField: '_id',     // Khớp _id của Session này...
  foreignField: 'session' // ...với trường 'session' bên kia
});

module.exports = mongoose.model('Session', SessionSchema);
