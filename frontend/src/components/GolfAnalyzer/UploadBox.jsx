import { useRef } from 'react';

export default function UploadBox({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="upload-box" onClick={() => fileInputRef.current.click()}>
      <h3>Thả video cú đánh của bạn vào đây</h3>
      <p>(Hỗ trợ MP4, MOV - Tối đa 50MB)</p>
      <button className="btn-upload">TẢI VIDEO LÊN</button>
      <input 
        type="file" 
        accept="video/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />
    </div>
  );
}
