// src/components/Dashboard/SessionCard.js
import React from 'react';
import { FaEllipsisH, FaVideo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // 1. Import cái này
import './SessionCard.css';

const SessionCard = ({ session }) => {
  const navigate = useNavigate(); // 2. Khai báo hook

  // 3. Hàm xử lý chuyển trang
  const handleClick = () => {
    // Nếu session có _id thì dùng, không thì dùng id (tùy backend trả về)
    const sessionId = session._id || session.id;
    if (sessionId) {
      navigate(`/sessions/${sessionId}`);
    } else {
      console.error("Session ID không tồn tại!");
    }
  };

  return (
    <div 
      className="session-card" 
      onClick={handleClick} // 4. Gắn sự kiện click vào đây
    >
      <div className="card-header">
        <h4 className="card-title">{session.title || 'Indoor Arena'}</h4>
        <button 
          className="options-btn" 
          onClick={(e) => { 
            e.stopPropagation(); // Ngăn không cho click lan ra ngoài (để không bị chuyển trang khi bấm menu)
            console.log("Menu clicked"); 
          }}
        >
          <FaEllipsisH />
        </button>
      </div>
      
      <div className="card-body">
        <p className="card-time">
          {session.createdAt 
            ? new Date(session.createdAt).toLocaleDateString('vi-VN') 
            : 'Mới tạo'}
        </p>
        <p className="card-videos">
           <FaVideo style={{ marginRight: 5 }}/> 
           {session.videoCount || 0} videos
        </p>
      </div>

      <div className="card-badges">
        <span className="badge score">Score: {session.score || 'N/A'}</span>
        <span className="badge band">Band: {session.band || 'N/A'}</span>
      </div>
    </div>
  );
};

export default SessionCard;
