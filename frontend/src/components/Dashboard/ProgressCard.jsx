import React from 'react';
import { FaFlag } from 'react-icons/fa';
import './ProgressCard.css';

const ProgressCard = ({ user }) => {
  // Lấy giá trị an toàn, mặc định là 1 nếu chưa có dữ liệu để tránh chia cho 0
  const currentXP = user?.xp || 0;
  const targetXP = user?.nextLevelXp || 2000; // Mặc định mốc 2000 nếu lỗi
  
  // Tính %
  let percent = (currentXP / targetXP) * 100;
  // Giới hạn max là 100% (không để tràn ra ngoài)
  percent = Math.min(percent, 100);

  return (
    <section className="progress-section">
      <div className="progress-card">
        {/* Lấy title từ backend tính toán */}
        <h3>{user?.rankTitle || "Beginner"}</h3>
        
        <div className="progress-bar-container">
          {/* Cờ chạy: Dùng style `left` để di chuyển */}
          <div 
            className="progress-flag" 
            style={{ 
              left: `${percent}%`, 
              position: 'absolute', 
              top: '-25px', 
              transition: 'left 0.5s ease-out' // Thêm hiệu ứng trượt mượt mà
            }}
          >
             <FaFlag color="#FFD700" /> {/* Đổi màu vàng cho nổi */}
          </div>

          {/* Thanh màu xanh đè lên */}
          {/* overflow: hidden ở container cha sẽ giúp cắt gọn phần này */}
          <div 
            className="progress-fill"
            style={{ 
              width: `${percent}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.3)', // Màu trắng mờ đè lên
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 'inherit',
              transition: 'width 0.5s ease-out'
            }}
          ></div>

          {/* Các đoạn màu nền (Background tĩnh) */}
          <div className="progress-segment red"></div>
          <div className="progress-segment orange"></div>
          <div className="progress-segment yellow"></div>
          <div className="progress-segment green"></div>
          <div className="progress-segment blue"></div>
        </div>
        
        <div style={{marginTop: '10px', fontSize: '0.8rem', textAlign: 'right', color: '#ccc'}}>
            {currentXP} / {targetXP} XP
        </div>
      </div>
    </section>
  );
};

export default ProgressCard;
