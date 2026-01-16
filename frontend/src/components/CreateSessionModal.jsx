import React, { useState, useEffect } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa'; // Thêm icon
import './CreateSessionModal.css';

const CreateSessionModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  
  // State quản lý ảnh
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
        setTitle('');
        setLocation('');
        setThumbnail(null);
        setPreviewUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      // Tạo URL tạm thời để hiện ảnh preview ngay lập tức
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    // Truyền thêm thumbnail (tham số thứ 3)
    await onCreate(title, location, thumbnail); 
    setIsSubmitting(false);
    onClose(); // Đóng modal sau khi tạo xong
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Tạo Buổi Tập Mới</h3>
        <p>Bắt đầu ghi lại hành trình Golf của bạn</p>
        
        <form onSubmit={handleSubmit}>
          
          {/* KHU VỰC CHỌN ẢNH BÌA */}
          <div className="form-group upload-group">
            <label>Ảnh bìa (Tùy chọn)</label>
            <input 
                type="file" 
                id="session-thumb" 
                accept="image/*" 
                onChange={handleFileChange}
                hidden // Ẩn nút chọn file xấu xí đi
            />
            
            <label htmlFor="session-thumb" className="upload-box-preview">
                {previewUrl ? (
                    // Nếu đã chọn ảnh -> Hiện ảnh preview
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" />
                        <div className="overlay-change">Đổi ảnh</div>
                    </div>
                ) : (
                    // Nếu chưa chọn ảnh -> Hiện nút bấm
                    <div className="placeholder-upload">
                        <FaImage size={24} color="#1B5E20" />
                        <span>Nhấn để chọn ảnh bìa</span>
                    </div>
                )}
            </label>
          </div>

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
