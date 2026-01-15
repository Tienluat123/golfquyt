const mongoose = require('mongoose');

// Hàm kết nối Database
const connectDB = async () => {
  try {
    // Lấy đường dẫn từ file .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // Nếu lỗi thì dừng server luôn để kiểm tra
    process.exit(1);
  }
};

module.exports = connectDB;
