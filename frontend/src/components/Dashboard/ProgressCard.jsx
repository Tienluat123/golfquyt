import React from 'react';
import { FaFlag } from 'react-icons/fa';

const ProgressCard = ({ user }) => {
  // Tính % an toàn (không quá 100%)
  const progressPercent = Math.min((user.xp / user.nextLevelXp) * 100, 100);

  return (
    <section className="progress-section">
      <div className="progress-card">
        <h3>{user.rankTitle}</h3>
        
        <div className="progress-bar-container">
          {/* Cờ chạy theo % */}
          <div 
            className="progress-flag" 
            style={{ left: `${progressPercent}%`, position: 'absolute', top: '-25px', transition: 'left 0.5s' }}
          >
             <FaFlag color="white" />
          </div>

          {/* Thanh màu nền lấp đầy */}
          <div style={{ width: `${progressPercent}%` }} className="progress-fill"></div>

          {/* Các đoạn màu trang trí */}
          <div className="progress-segment red"></div>
          <div className="progress-segment orange"></div>
          <div className="progress-segment yellow"></div>
          <div className="progress-segment green"></div>
          <div className="progress-segment blue"></div>
        </div>
        
        <div style={{marginTop: '10px', fontSize: '0.8rem', textAlign: 'right'}}>
            {user.xp} / {user.nextLevelXp} XP
        </div>
      </div>
    </section>
  );
};

export default ProgressCard;
