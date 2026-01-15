const analysisService = require('../services/analysis.service');

exports.analyzeVideo = async (req, res) => {
  try {
    // 1. Validate Input
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // 2. Gọi Service (Mọi logic khó nằm bên kia rồi)
    const result = await analysisService.processAnalysis(req.file);

    // 3. Trả kết quả thành công
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
