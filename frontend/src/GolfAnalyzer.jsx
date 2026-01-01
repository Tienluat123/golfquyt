// src/GolfAnalyzer.jsx
import { useState, useRef } from 'react';
import './GolfAnalyzer.css'; // File style chúng ta sẽ tạo sau

export default function GolfAnalyzer() {
  const [status, setStatus] = useState('idle'); // idle | processing | done
  const [videoSrc, setVideoSrc] = useState(null);
  const [loadingText, setLoadingText] = useState('Đang khởi động AI...');
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  // Hàm xử lý khi chọn Video
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setStatus('processing');
      setProgress(0);
      setLoadingText('Đang tải video lên...');
      setAnalysisResult(null);

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Giả lập thanh progress bar chạy trong lúc chờ server
        let progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 5;
            });
        }, 200);

        const response = await fetch('http://127.0.0.1:5001/analyze', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (response.ok) {
          // Read headers
          const band = response.headers.get('X-Golf-Band');
          const probs = response.headers.get('X-Golf-Probs');
          const swingSpeed = response.headers.get('X-Swing-Speed');
          const armAngle = response.headers.get('X-Arm-Angle');
          
          console.log('Headers Received:', { band, probs, swingSpeed, armAngle });

          setAnalysisResult({
            band: band || 'Unknown',
            probs: probs,
            swingSpeed: parseFloat(swingSpeed || 0).toFixed(2),
            armAngle: parseFloat(armAngle || 0).toFixed(1)
          });

          const blob = await response.blob();
          const videoUrl = URL.createObjectURL(blob);
          setVideoSrc(videoUrl);
          setStatus('done');
        } else {
          alert('Có lỗi xảy ra khi xử lý video!');
          setStatus('idle');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Không thể kết nối tới server!');
        setStatus('idle');
      }
    }
  };

  // Hàm Reset để làm lại

  // Hàm Reset để làm lại
  const handleReset = () => {
    setStatus('idle');
    setVideoSrc(null);
  };

  return (
    <div className="analyzer-container">
      
      {/* --- PHẦN 1: UPLOAD (INPUT) --- */}
      {status === 'idle' && (
        <div className="upload-box" onClick={() => fileInputRef.current.click()}>
          <div className="icon-upload">📂</div>
          <h3>Thả video cú đánh của bạn vào đây</h3>
          <p>(Hỗ trợ MP4, MOV - Tối đa 50MB)</p>
          <button className="btn-upload">TẢI VIDEO LÊN</button>
          {/* Input ẩn */}
          <input 
            type="file" 
            accept="video/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* --- PHẦN 2: MÀN HÌNH CHỜ (PROCESSING) --- */}
      {status === 'processing' && (
        <div className="processing-box">
          <div className="loader-circle"></div>
          <h3>{loadingText}</h3>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p>{progress}% hoàn thành</p>
        </div>
      )}

      {/* --- PHẦN 3: KẾT QUẢ (OUTPUT) --- */}
      {status === 'done' && (
        <div className="result-card">
          <div className="video-section">
            {/* Đây là chỗ sau này sẽ hiện video đã vẽ xương */}
            <video src={videoSrc} controls autoPlay loop width="100%" />
          </div>

          <div className="score-section">
            <h2>KẾT QUẢ PHÂN TÍCH</h2>
            
            <div className="rank-card">
              <div className="rank-title">HANDICAP BAND</div>
              <div className="rank-value">
                {analysisResult?.band ? analysisResult.band.replace('_', '-') : 'Unknown'}
              </div>
              <div className="rank-stars">
                {/* Logic đảo ngược: Band thấp (1-2) ít sao, Band cao (8-10) nhiều sao */}
                {analysisResult?.band === '1_2' ? '⭐' : 
                 analysisResult?.band === '2_4' ? '⭐⭐' :
                 analysisResult?.band === '4_6' ? '⭐⭐⭐' :
                 analysisResult?.band === '6_8' ? '⭐⭐⭐⭐' : 
                 analysisResult?.band === '8_10' ? '⭐⭐⭐⭐⭐' : ''}
              </div>
            </div>
            
            <div className="stats-grid">
              {/* Tốc độ */}
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">🚀</span>
                  <span>Tốc độ Swing</span>
                </div>
                <div className="stat-number">{analysisResult?.swingSpeed || '--'} <small>units</small></div>
                <div className="visual-bar">
                  {/* Giả sử max speed là 10 để tính % bar */}
                  <div className="visual-fill" style={{width: `${Math.min((analysisResult?.swingSpeed || 0) * 10, 100)}%`, background: '#ef5350'}}></div>
                </div>
                <span className="stat-desc">Tốc độ cổ tay tối đa</span>
              </div>

              {/* Góc tay */}
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">📐</span>
                  <span>Góc tay</span>
                </div>
                <div className="stat-number">{analysisResult?.armAngle || '--'}<small>°</small></div>
                <div className="visual-bar">
                  <div className="visual-fill" style={{width: `${Math.min(((analysisResult?.armAngle || 0) / 180) * 100, 100)}%`, background: '#ffa726'}}></div>
                </div>
                <span className="stat-desc">Độ duỗi tay trái tối đa</span>
              </div>
            </div>

            <button onClick={handleReset} className="btn-retry">
              🔄 Phân tích video khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
