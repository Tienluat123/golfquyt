const path = require('path');
const fs = require('fs');
const { runPythonScript } = require('../utils/pythonRunner');
const aiService = require('./ai.service');
const Analysis = require('../models/Analysis');
const sessionService = require('./session.service');
const User = require('../models/User');

const { estimateScoreFromBand } = require('../utils/bandMapper');

const calculateExpFromBand = (band) => {
    // band format can be "1_2", "2_4", "4_6", etc. or "1-2"
    if (!band) return 0;
    const normalizedBand = band.replace('-', '_');

    if (["1_2", "2_4"].includes(normalizedBand)) return 0;
    if (["4_6", "6_8"].includes(normalizedBand)) return 1;
    if (["8_10"].includes(normalizedBand)) return 2;
    return 0;
};

exports.processAnalysis = async (file, sessionId = null, userId = null) => {

    // 1. Setup đường dẫn (Giữ nguyên)
    const outputFilename = `processed-${Date.now()}-${file.filename}`;
    const outputDir = path.resolve(__dirname, '../processed');
    const outputPath = path.join(outputDir, outputFilename);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // 2. Chạy Python
    const scriptPath = path.resolve(__dirname, '../services/process_video.py');

    // metrics nhận được: { band, swing_speed, arm_angle... } KHÔNG CÓ SCORE
    let metrics = await runPythonScript(scriptPath, [file.path, outputPath]);

    // 3. Xử lý bổ sung (Logic mới)
    // Nếu Python không trả score, ta tự tính score từ Band để lưu vào DB (nếu muốn hiện con số)
    if (!metrics.score && metrics.band) {
        // Ví dụ: Band "8_10" -> Score 90
        metrics.score = estimateScoreFromBand(metrics.band);
    }

    // Xóa file temp
    fs.unlink(file.path, (err) => { if (err) console.error(err); });

    // 4. Gọi AI Advice
    // Truyền metrics đầy đủ (đã có thêm score giả lập) cho AI chém gió
    const advice = await aiService.getGolfAdvice(metrics);

    // 5. Lưu vào DB
    const newAnalysis = new Analysis({
        session: sessionId,
        user: userId,
        originalVideoUrl: file.path,
        processedVideoUrl: `/processed/${outputFilename}`,
        thumbnailUrl: `/processed/${outputFilename}`,
        metrics: metrics, // Lưu metrics đã được bổ sung score
        aiAdvice: advice,
        status: 'completed'
    });

    await newAnalysis.save();

    // 6. Update User EXP based on Band
    if (userId && metrics.band) {
        const expToAdd = calculateExpFromBand(metrics.band);
        if (expToAdd > 0) {
            try {
                await User.findByIdAndUpdate(userId, {
                    $inc: { experiencePoints: expToAdd }
                });
            } catch (error) {
                console.error('Failed to update user EXP:', error);
            }
        }
    }

    try { await sessionService.updateSessionAggregates(sessionId); } catch (e) { console.error('Session update failed:', e); }

    return newAnalysis;
};


exports.getAnalysisById = async (analysisId) => {
    const analysis = await Analysis.findById(analysisId)
        .populate('session', 'title');
    return analysis;
};
