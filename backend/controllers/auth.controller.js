// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // 2. Mã hóa mật khẩu (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
      // Các trường khác như rankTitle sẽ lấy giá trị default
    });

    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công! Hãy đăng nhập." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // 2. So sánh mật khẩu nhập vào với mật khẩu mã hóa trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // 3. Tạo Token (Thẻ bài thông hành)
    // Lưu ý: Cần thêm JWT_SECRET vào file .env nhé
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret_tam_thoi', 
      { expiresIn: '1d' } // Token hết hạn sau 1 ngày
    );

    // 4. Trả về thông tin user (trừ password) và token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        rankTitle: user.rankTitle,
        xp: user.experiencePoints,
        nextLevelXp: 2000
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
