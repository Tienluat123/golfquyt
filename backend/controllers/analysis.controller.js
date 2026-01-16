const analysisService = require('../services/analysis.service');
const Analysis = require('../models/Analysis');

exports.analyzeVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Thiếu Session ID' });
    }

    const userId = req.user && req.user.id ? req.user.id : null;
    const result = await analysisService.processAnalysis(req.file, sessionId, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Processing failed', 
      details: error.message 
    });
  }
};


exports.getAnalysisDetail = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL (vd: /api/analyze/12345)

    const analysis = await analysisService.getAnalysisById(id);

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy video này' });
    }

    // Kiểm tra quyền (Optional): Chỉ chủ sở hữu mới được xem
    // if (analysis.user.toString() !== req.user.id) {
    //    return res.status(403).json({ success: false, error: 'Không có quyền truy cập' });
    // }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error("Get Detail Error:", error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
};

