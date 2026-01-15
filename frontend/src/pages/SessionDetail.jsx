import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaPlus, FaPlay } from 'react-icons/fa';
import axiosClient from '../utils/axiosConfig';
import './SessionDetail.css';

const SessionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionDetail();
  }, [id]);

  const fetchSessionDetail = async () => {
    try {
      setLoading(false);
      const response = await axiosClient.get(`/sessions/${id}`);
      setSession(response.data);
    } catch (err) {
      console.error('Error fetching session:', err);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/sessions');
  };

  const handleAddVideo = () => {
    // Navigate to add video page
    console.log('Add video');
  };

  const handleVideoClick = (videoId) => {
    // Navigate to video detail/player
    console.log('Play video:', videoId);
    navigate(`/sessions/${id}/video/${videoId}`);
  };

  // Mock data
  const mockSession = {
    id: id,
    title: 'Indoor Arena',
    score: '###',
    band: '4-6',
    aiComment: 'áddadasdadasdasdas',
    image: 'https://www.figma.com/api/mcp/asset/ffd91db1-e469-462f-8ef2-9840fab1d84c',
    videos: [
      { id: 1, time: '7:30', score: '###', band: '4-6', thumbnail: 'https://www.figma.com/api/mcp/asset/ffd91db1-e469-462f-8ef2-9840fab1d84c' }
    ]
  };

  const displaySession = session || mockSession;

  if (loading) {
    return (
      <div className="session-detail-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="session-detail-container">
      {/* Back Button */}
      <div className="session-detail-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
          <span>Session</span>
        </button>
      </div>

      {/* Main Image */}
      <div className="session-detail-image">
        <img src={displaySession.image} alt={displaySession.title} />
      </div>

      {/* Session Title */}
      <h1 className="session-detail-title">{displaySession.title}</h1>

      {/* Stats Cards */}
      <div className="session-stats-grid">
        <div className="session-stat-card">
          <p className="stat-label">Score</p>
          <p className="stat-value">{displaySession.score}</p>
        </div>
        <div className="session-stat-card">
          <p className="stat-label">Band</p>
          <p className="stat-value">{displaySession.band}</p>
        </div>
      </div>

      {/* AI Comment */}
      <div className="ai-comment-box">
        <FaRobot className="ai-icon" />
        <p className="ai-comment-text">{displaySession.aiComment}</p>
      </div>

      {/* Videos Section */}
      <h2 className="videos-section-title">Indoor Arena</h2>
      
      <div className="videos-grid">
        {/* Add Video Card */}
        <div className="video-card add-video-card" onClick={handleAddVideo}>
          <FaPlus className="add-video-icon" />
        </div>

        {/* Video Cards */}
        {displaySession.videos.map((video) => (
          <div 
            key={video.id} 
            className="video-card"
            style={{ backgroundImage: `url(${video.thumbnail})` }}
            onClick={() => handleVideoClick(video.id)}
          >
            <div className="video-time-overlay">{video.time}</div>
            
            <div className="video-thumbnail">
              <div className="video-play-button">
                <FaPlay />
              </div>
            </div>
            
            <div className="video-stats">
              <span className="video-stat-badge">Score: {video.score}</span>
              <span className="video-stat-badge">Band: {video.band}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionDetail;
