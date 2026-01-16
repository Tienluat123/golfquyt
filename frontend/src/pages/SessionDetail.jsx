import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaPlus, FaPlay } from 'react-icons/fa';
import axiosClient from '../utils/axiosConfig';
import UploadModal from '../components/UploadModal'; // <--- Import Modal Upload (Nhớ tạo file này hoặc dùng lại cái cũ)
import { analyzeVideo } from '../services/analysis.service'; // Service gọi API upload
import './SessionDetail.css';

const SessionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy Session ID từ URL
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal Upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load dữ liệu khi vào trang
  useEffect(() => {
    fetchSessionDetail();
  }, [id]);

  const fetchSessionDetail = async () => {
    try {
      setLoading(true);
      // Gọi API Backend
      const response = await axiosClient.get(`/sessions/${id}`);
      // axiosClient may return the raw response body or the wrapper { success, data 
      const payload = response.data || response;
      const sessionData = payload.data || payload;
      setSession(sessionData);
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/dashboard');

  const handleAddVideoClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadVideo = async (file, title) => {
    try {
      // 1. Chuẩn bị Form Data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', id); // <--- Gửi kèm ID session để backend biết lưu vào đâu

      // 2. Gọi API Upload
      await analyzeVideo(formData); 
      
      // 3. Tắt Modal & Reload lại dữ liệu để hiện video mới
      setIsUploadModalOpen(false);
      fetchSessionDetail(); 
      alert("Phân tích thành công!");

    } catch (error) {
      console.error(error);
      alert("Lỗi upload: " + (error.response?.data?.error || error.message));
    }
  };

  const handleVideoClick = (video) => {
    // Chuyển sang trang xem video full màn hình (SessionAnalysis)
    // Truyền dữ liệu qua state để không phải fetch lại
    navigate(`/sessions/${id}/video/${video._id}`, { 
      state: { 
        data: { data: video }, // Format cho khớp với trang Analysis
        videoUrl: video.processedVideoUrl 
      } 
    });
  };

  if (loading) {
    return <div className="session-detail-container"><div className="loading-message">Loading...</div></div>;
  }

  // Nếu không tìm thấy session
  if (!session) return <div className="session-detail-container">Session not found</div>;

  // --- MAPPING DATA (Kết nối dữ liệu thật) ---
  const displayTitle = session.title || 'Indoor Arena';
  const displayImage = session.thumbnailUrl || 'https://via.placeholder.com/800x400?text=Golf+Session'; // Ảnh default
  const displayScore = session.overallScore || 'N/A';
  const displayBand = session.overallBand || 'N/A';
  const aiComment = session.aiSummary || "Chưa có nhận xét tổng quan.";
  
  // Lấy danh sách video từ trường 'analyses' (do virtual populate)
  const videoList = session.analyses || [];

  return (
    <div className="session-detail-container">
      {/* Header */}
      <div className="session-detail-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Image */}
      <div className="session-detail-image">
        {/* Nếu là video url thì dùng thẻ video, nếu ảnh thì dùng img */}
        {displayImage.endsWith('.mp4') ? (
            <video src={`http://localhost:5001${displayImage}`} className="cover-media" muted autoPlay loop />
        ) : (
            <img src={displayImage} alt={displayTitle} className="cover-media" />
        )}
      </div>

      <h1 className="session-detail-title">{displayTitle}</h1>

      {/* Stats Cards */}
      <div className="session-stats-grid">
        <div className="session-stat-card">
          <p className="stat-label">Overall Score</p>
          <p className="stat-value">{displayScore}</p>
        </div>
        <div className="session-stat-card">
          <p className="stat-label">Est. Band</p>
          <p className="stat-value">{displayBand}</p>
        </div>
      </div>

      {/* AI Comment */}
      <div className="ai-comment-box">
        <FaRobot className="ai-icon" />
        <p className="ai-comment-text">{aiComment}</p>
      </div>

      {/* Videos List */}
      <h2 className="videos-section-title">Session Videos ({videoList.length})</h2>
      
      <div className="videos-grid">
        {/* Nút Add Video */}
        <div className="video-card add-video-card" onClick={handleAddVideoClick}>
          <FaPlus className="add-video-icon" />
          <span>Add Swing</span>
        </div>

        {/* Render danh sách video thật */}
        {videoList.map((video, index) => (
          <div 
            key={video._id || index} 
            className="video-card"
            // Nếu có thumbnail riêng thì dùng, ko thì dùng ảnh default
            style={{ 
                backgroundImage: `url(${video.thumbnailUrl || 'https://via.placeholder.com/300?text=Swing'})`,
                backgroundSize: 'cover'
            }}
            onClick={() => handleVideoClick(video)}
          >
            <div className="video-time-overlay">
                {new Date(video.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            
            <div className="video-thumbnail">
              <div className="video-play-button"><FaPlay /></div>
            </div>
            
            <div className="video-stats">
              <span className="video-stat-badge">Band: {video.metrics?.band || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Upload (Ẩn/Hiện) */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadVideo} // Hàm xử lý khi bấm nút Upload trong modal
      />
    </div>
  );
};

export default SessionDetail;
