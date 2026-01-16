const Session = require('../models/Session');
const Analysis = require('../models/Analysis');
const aiService = require('./ai.service');
const { convertBandToPoint, convertPointToBand, estimateScoreFromBand } = require('../utils/bandMapper');

exports.updateSessionAggregates = async (sessionId) => {
    try {
        // 1. Lấy tất cả video đã xong của session này
        const analyses = await Analysis.find({ 
            session: sessionId, 
            status: 'completed' 
        }).sort({ createdAt: 1 });

        if (analyses.length === 0) return;

        const totalPoints = analyses.reduce((sum, item) => {
            // Lấy band từ kết quả Python (metrics.band)
            const band = item.metrics.band || "1_2"; 
            return sum + convertBandToPoint(band);
        }, 0);

        const avgPoint = totalPoints / analyses.length;

        const overallBand = convertPointToBand(avgPoint);

        const avgScore = Math.round(avgPoint * 20 - 10); 
        const latestVideo = analyses[analyses.length - 1];


        let summaryText = "";

        if (analyses.length === 1) {
            // Case 1: Mới có 1 video -> Lấy luôn advice của video đó cho nhanh
            summaryText = analyses[0].aiAdvice;
        } else {
            // Case 2: Nhiều video -> Gọi AI tổng hợp lại
            // (Lưu ý: Có thể tốn vài giây xử lý)
            summaryText = await aiService.generateSessionSummary(analyses);
        }


        await Session.findByIdAndUpdate(sessionId, {
            overallBand: overallBand,
            overallScore: avgScore,   
            videoCount: analyses.length,
            thumbnailUrl: latestVideo.processedVideoUrl,
            aiSummary: summaryText
        });

        console.log(`Updated Session: ${analyses.length} videos -> Avg Band: ${overallBand}`);

    } catch (error) {
        console.error("Lỗi update session:", error);
    }
};
