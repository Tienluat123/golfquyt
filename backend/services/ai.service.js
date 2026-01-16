const groq = require('../config/groq');

exports.getGolfAdvice = async (metrics) => {
    try {
        const { band, swing_speed, arm_angle } = metrics;

        // 1. Prompt (Kịch bản) cho Llama 3
        const systemPrompt = `
            Bạn là một HLV Golf chuyên nghiệp (PGA), vui tính và súc tích.
            Nhiệm vụ: Dựa vào thông số kỹ thuật của học viên, hãy đưa ra nhận xét ngắn gọn (tối đa 3 câu).
            
            Quy tắc chấm:
            - Tốc độ Swing > 35m/s: Khen ngợi sức mạnh (Pro). < 25m/s: Cần cải thiện lực.
            - Góc tay (Arm Angle) < 150 độ: Lỗi co tay (Chicken Wing). > 160 độ: Tốt.
            
            Cấu trúc trả lời:
            1. Một lời khen.
            2. Chỉ ra lỗi sai (nếu có).
            3. Gợi ý 1 bài tập (Drill).
            
            Trả lời bằng tiếng Việt tự nhiên.
        `;

        const userPrompt = `
            Thông số học viên:
            - Xếp hạng: Band ${band}
            - Tốc độ Swing: ${swing_speed ? swing_speed.toFixed(2) : 0} m/s
            - Góc tay trái tại Impact: ${arm_angle ? arm_angle.toFixed(2) : 0} độ.
        `;

        // 2. Gọi Groq API (Model Llama3-70b - Thông minh nhất của Groq)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile", // Model này thông minh và miễn phí
            temperature: 0.6,         // Độ sáng tạo vừa phải
            max_tokens: 300,          // Giới hạn độ dài câu trả lời
        });

        return chatCompletion.choices[0]?.message?.content || "HLV đang suy nghĩ...";

    } catch (error) {
        console.error(" Groq AI Error:", error.message);
        // Fallback an toàn nếu Groq lỗi
        return "Hệ thống AI đang bảo trì, nhưng cú đánh của bạn có thông số khá tốt!";
    }
};


exports.generateSessionSummary = async (analyses) => {
    try {
        // 1. Tóm tắt dữ liệu lịch sử để gửi cho AI (cho nhẹ token)
        const history = analyses.map((a, i) => 
            `Cú ${i+1}: Band ${a.metrics.band}, Lỗi: ${a.aiAdvice}`
        ).join("\n");

        const prompt = `
            Bạn là HLV Golf. Dựa vào lịch sử các cú đánh sau của học viên trong 1 buổi tập:
            ${history}

            Hãy đưa ra 1 nhận xét tổng quan ngắn gọn (tối đa 2 câu tiếng Việt) về phong độ và sự tiến bộ của họ. 
            Ví dụ: "Bạn khởi đầu tốt nhưng về sau bị đuối sức. Cần chú ý giữ tay thẳng."
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 200,
        });

        return chatCompletion.choices[0]?.message?.content || "Tiếp tục luyện tập nhé!";
    } catch (error) {
        console.error("AI Summary Error:", error);
        return "Hệ thống đang bận, nhưng hãy cố gắng duy trì phong độ!";
    }
};
