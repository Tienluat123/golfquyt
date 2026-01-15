const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: "Indoor Arena" },
  location: { type: String },
  date: { type: Date, default: Date.now },
  
  // Kết quả tổng quan hiển thị bên ngoài card
  overallScore: { type: Number, default: 0 },
  overallBand: { type: String, default: "N/A" },
  thumbnailUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
