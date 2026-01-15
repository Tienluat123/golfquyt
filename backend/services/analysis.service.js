const path = require('path');
const fs = require('fs');
const { runPythonScript } = require('../utils/pythonRunner');
const aiService = require('./ai.service'); // Service gọi Groq/ChatGPT đã làm lúc nãy

exports.processAnalysis = async (file) => {
  
    // 1. Setup đường dẫn
    const outputFilename = `processed-${Date.now()}-${file.filename}`;
    const outputDir = path.resolve(__dirname, '../processed');
    const outputPath = path.join(outputDir, outputFilename);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // 2. Gọi Python (Code gọn hơn hẳn nhờ hàm utils)
    const scriptPath = path.resolve(__dirname, '../services/process_video.py'); 
    const metrics = await runPythonScript(scriptPath, [file.path, outputPath]);

    // 3. Xóa file input gốc (Dọn dẹp)
    fs.unlink(file.path, (err) => { if(err) console.error(err); });

    // 4. Gọi AI xin lời khuyên (Logic AI nằm ở service riêng)
    const advice = await aiService.getGolfAdvice(metrics);

    // 5. Trả về kết quả cuối cùng
    return {
        metrics: metrics,
        ai_advice: advice,
        video_url: `/processed/${outputFilename}`
    };
};
