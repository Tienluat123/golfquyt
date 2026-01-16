import React, { useState } from 'react';
import './CreateSessionModal.css'; // File CSS ở bước 3

const CreateSessionModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await onCreate(title, location); // Gọi hàm từ cha truyền xuống
    setIsSubmitting(false);
    
    // Reset form
    setTitle('');
    setLocation('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Tạo Buổi Tập Mới</h3>
        <p>Bắt đầu ghi lại hành trình Golf của bạn</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên buổi tập</label>
            <input 
              type="text" 
              placeholder="VD: Tập Driver tại Him Lam..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Địa điểm (Tùy chọn)</label>
            <input 
              type="text" 
              placeholder="VD: Quận 7, Thủ Đức..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
            <button type="submit" className="btn-create" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo Ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;
