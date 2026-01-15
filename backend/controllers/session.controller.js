const Session = require('../models/Session');

exports.getMySessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Mặc định lấy 10, Dashboard sẽ truyền 3
    
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .limit(limit);

    // Format dữ liệu trả về cho đẹp
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      title: session.title,
      date: session.createdAt,
      videoCount: 5, // Tạm thời hardcode, sau này đếm từ bảng Analysis
      score: session.overallScore,
      band: session.overallBand
    }));

    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
