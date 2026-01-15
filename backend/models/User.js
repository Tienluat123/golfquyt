const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Lưu ý: Nên mã hóa password trước khi lưu
  avatar: { type: String },
  location: { type: String, default: "Ho Chi Minh city, Vietnam" },
  
  // Game hóa (Gamification)
  rankTitle: { type: String, default: "Beginner" },
  experiencePoints: { type: Number, default: 0 },
}, { timestamps: true }); // Tự động tạo createdAt, updatedAt

module.exports = mongoose.model('User', UserSchema);
