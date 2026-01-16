const Session = require('../models/Session');
// Ensure Analysis model is registered with mongoose before populate
require('../models/Analysis');

exports.createSession = async (req, res) => {
  try {
    const { title, location } = req.body;

    console.log("Body nhận được:", req.body);
    console.log("File nhận được:", req.file);

    if (!title) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên buổi tập" });
    }

    // --- XỬ LÝ ẢNH UPLOAD ---
    let thumbnailUrl = "";
    if (req.file) {
        // Lưu đường dẫn tương đối để frontend gọi
        // Giả sử multer lưu vào thư mục 'uploads'
        thumbnailUrl = `/uploads/${req.file.filename}`;
    }

    const newSession = new Session({
      user: req.user && req.user.id ? req.user.id : null,
      title: title,
      location: location || "Sân tập",
      
      // Lưu đường dẫn ảnh vào đây
      thumbnailUrl: thumbnailUrl, 
      
      // Các trường khác mặc định
      overallScore: 0,
      overallBand: "N/A",
      videoCount: 0
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      data: newSession
    });

  } catch (error) {
    console.error("Lỗi tạo session:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .limit(limit);

    // Format dữ liệu
    const formattedSessions = sessions.map(session => ({
      _id: session._id, // Frontend thường dùng _id hoặc id, giữ _id cho khớp MongoDB
      title: session.title,
      date: session.createdAt,
      videoCount: session.videoCount || 0, 
      
      score: session.overallScore || 0,
      band: session.overallBand || "N/A",
      aiSummary: session.aiSummary || "",
    
      thumbnailUrl: session.thumbnailUrl || "" 
    }));

    // 3. Bọc trong object chuẩn
    res.json({
      success: true,
      data: formattedSessions
    });

  } catch (error) {
    console.error("Lỗi lấy sessions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Không thể tải danh sách buổi tập" 
    });
  }
};


// backend/controllers/session.controller.js

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('analyses'); // <--- QUAN TRỌNG: Lấy luôn danh sách video con

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
