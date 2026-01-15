export default function ResultView({ videoSrc, analysisResult, onReset }) {
  return (
    <div className="result-card">
      <div className="video-section">
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
              <span>Tốc độ Swing</span>
            </div>
            <div className="stat-number">{analysisResult?.swingSpeed || '--'} <small>units</small></div>
            <div className="visual-bar">
              <div className="visual-fill" style={{width: `${Math.min((analysisResult?.swingSpeed || 0) * 10, 100)}%`, background: '#ef5350'}}></div>
            </div>
            <span className="stat-desc">Tốc độ cổ tay tối đa</span>
          </div>

          {/* Góc tay */}
          <div className="stat-item">
            <div className="stat-header">
              <span>Góc tay</span>
            </div>
            <div className="stat-number">{analysisResult?.armAngle || '--'}<small>°</small></div>
            <div className="visual-bar">
              <div className="visual-fill" style={{width: `${Math.min(((analysisResult?.armAngle || 0) / 180) * 100, 100)}%`, background: '#ffa726'}}></div>
            </div>
            <span className="stat-desc">Độ duỗi tay trái tối đa</span>
          </div>
        </div>

        <button onClick={onReset} className="btn-retry">
        Phân tích video khác
        </button>
      </div>
    </div>
  );
}
