// src/components/common/ErrorDisplay.js
import React from 'react';
import './ErrorDisplay.css'; // Import file CSS riêng

const ErrorDisplay = ({ 
  message = "Đã xảy ra lỗi không mong muốn.", 
  title = "Rất tiếc!", 
  onRetry = null, 
  isGlobal = false 
}) => {
  return (
    <div className={`error-container ${isGlobal ? 'error-global' : ''}`}>
      <div className="error-icon">
        {/* SVG Icon cảnh báo đẹp hơn text emoji */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        
        {/* Chỉ hiện nút Thử lại nếu truyền hàm onRetry vào */}
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            <span>↻</span> Thử lại ngay
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
