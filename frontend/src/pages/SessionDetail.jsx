import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaPlus, FaPlay } from 'react-icons/fa';
import axiosClient from '../utils/axiosConfig';
import UploadModal from '../components/UploadModal'; 
import { analyzeVideo } from '../services/analysis.service'; 
import './SessionDetail.css';

// Định nghĩa URL Server để dùng chung
const SERVER_URL = 'http://localhost:5001';

const SessionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchSessionDetail();
  }, [id]);

  const fetchSessionDetail = async () => {
    try {
      // Gọi API Backend
      const response = await axiosClient.get(`/sessions/${id}`);
      console.log('Fetched session detail:', response);
      // Xử lý dữ liệu trả về linh hoạt
      const sessionData = response.data?.data || response.data || response;
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', id); 

      await analyzeVideo(formData); 
      
      setIsUploadModalOpen(false);
      fetchSessionDetail(); 
      alert("Phân tích thành công!");

    } catch (error) {
      console.error(error);
      alert("Lỗi upload: " + (error.response?.data?.error || error.message));
    }
  };

  const handleVideoClick = (video) => {
    // Chuyển sang trang xem video full màn hình
    navigate(`/sessions/${id}/video/${video._id}`, { 
      state: { 
        videoData: video, 
        sessionTitle: session.title 
      } 
    });
  };

  if (loading) return <div className="session-detail-container"><div className="loading-message">Loading...</div></div>;

  if (!session) return <div className="session-detail-container">Session not found</div>;

  // --- MAPPING DATA ---
  const displayTitle = session.title || 'Indoor Arena';
  
  // Xử lý URL ảnh cover (Main Image)
  let coverSrc = session.thumbnailUrl || 'https://via.placeholder.com/800x400?text=Golf+Session';
  if (coverSrc.startsWith('/')) {
      coverSrc = `${SERVER_URL}${coverSrc}`;
  }

  const displayScore = session.overallScore || 'N/A';
  const displayBand = session.overallBand || 'N/A';
  const aiComment = session.aiSummary || "Chưa có nhận xét tổng quan.";
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

      {/* Main Image / Video Cover */}
      <div className="session-detail-image">
        {coverSrc.endsWith('.mp4') ? (
            <video src={coverSrc} className="cover-media" muted autoPlay loop playsInline />
        ) : (
            <img src={coverSrc} alt={displayTitle} className="cover-media" />
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
        {videoList.map((video, index) => {
            // Tính toán URL video cho từng item trong vòng lặp
            let itemVideoSrc = video.processedVideoUrl || '';
            if (itemVideoSrc.startsWith('/')) {
                itemVideoSrc = `${SERVER_URL}${itemVideoSrc}`;
            }

            return (
              <div 
                key={video._id || index} 
                className="video-card"
                onClick={() => handleVideoClick(video)}
              >
                {/* VIDEO HOVER PLAYER */}
                <video 
                    src={itemVideoSrc}
                    className="card-video-bg"
                    muted 
                    loop
                    preload="metadata" // Chỉ tải metadata nhẹ
                    onMouseOver={event => event.target.play()} // Di chuột vào -> Play
                    onMouseOut={event => {
                        event.target.pause(); 
                        event.target.currentTime = 0; // Di chuột ra -> Dừng & Reset
                    }}
                />
                
                <div className="video-time-overlay">
                    {new Date(video.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                
                {/* Play icon overlay */}
                <div className="video-thumbnail">
                  <div className="video-play-button"><FaPlay /></div>
                </div>
                
                <div className="video-stats">
                  <span className="video-stat-badge">Band: {video.metrics?.band || 'N/A'}</span>
                </div>
              </div>
            );
        })}
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadVideo} 
      />
    </div>
  );
};

export default SessionDetail;
