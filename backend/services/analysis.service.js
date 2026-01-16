const path = require('path');
const fs = require('fs');
const { runPythonScript } = require('../utils/pythonRunner');
const aiService = require('./ai.service'); // Service gọi Groq/ChatGPT đã làm lúc nãy
const Analysis = require('../models/Analysis');
const sessionService = require('./session.service');


exports.processAnalysis = async (file, sessionId = null, userId = null) => {
    // Ensure dependent models/services are loaded

    const outputFilename = `processed-${Date.now()}-${file.filename}`;
    const outputDir = path.resolve(__dirname, '../processed');
    const outputPath = path.join(outputDir, outputFilename);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const scriptPath = path.resolve(__dirname, '../services/process_video.py'); 
    const metrics = await runPythonScript(scriptPath, [file.path, outputPath]);

    // Remove temp upload
    fs.unlink(file.path, (err) => { if(err) console.error(err); });

    const advice = await aiService.getGolfAdvice(metrics);

    const newAnalysis = new Analysis({
        session: sessionId,
        user: userId,
        originalVideoUrl: file.path, 
        processedVideoUrl: `/processed/${outputFilename}`, 
        metrics: metrics, 
        aiAdvice: advice,
        status: 'completed'
    });

    await newAnalysis.save();

    // Update session aggregates (ignore errors)
    try { await sessionService.updateSessionAggregates(sessionId); } catch (e) { console.error('Session aggregates update failed:', e); }

    return newAnalysis;
};


exports.getAnalysisById = async (analysisId) => {
    const analysis = await Analysis.findById(analysisId)
                                   .populate('session', 'title'); 
    return analysis;
};
