import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Vui lòng chọn video!");

    setIsUploading(true);
    // Gọi hàm onUpload được truyền từ SessionDetail xuống
    // Tham số thứ 2 là title (để trống hoặc lấy tên file)
    await onUpload(file, file.name); 
    
    setIsUploading(false);
    setFile(null); // Reset file sau khi upload xong
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h3>Upload Swing Video</h3>
        <p className="modal-desc">Chọn video quay cú đánh của bạn để AI phân tích.</p>

        <form onSubmit={handleSubmit}>
          
          {/* Khu vực kéo thả / chọn file */}
          <div className="upload-area">
            <input 
              type="file" 
              id="video-upload" 
              accept="video/*" 
              onChange={handleFileChange} 
              hidden 
            />
            <label htmlFor="video-upload" className="upload-label">
              <FaCloudUploadAlt size={48} className="upload-icon" />
              <span className="upload-text">
                {file ? file.name : "Nhấn để chọn Video"}
              </span>
              <span className="upload-subtext">Hỗ trợ MP4, MOV</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-upload" 
              disabled={!file || isUploading}
            >
              {isUploading ? "Đang xử lý..." : "Bắt đầu Phân tích"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
