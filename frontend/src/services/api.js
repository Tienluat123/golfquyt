export const analyzeVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://127.0.0.1:5001/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  const responseData = await response.json();
  const { metrics, ai_advice, video_url } = responseData.data;

  return {
    result: {
      band: metrics.band || 'Unknown',
      // probs: metrics.probs, // Nếu python có trả về
      swingSpeed: parseFloat(metrics.swing_speed || 0).toFixed(2),
      armAngle: parseFloat(metrics.arm_angle || 0).toFixed(1),
      aiAdvice: ai_advice // Thêm cái này để hiển thị lời khuyên
    },
    // Ghép host vào đường dẫn tương đối để thành link video hoàn chỉnh
    videoUrl: `http://127.0.0.1:5001${video_url}`
  };
};
