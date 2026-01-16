import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaPlay, FaPause } from 'react-icons/fa';
import './VideoAnalysis.css';
// 👇 1. THÊM IMPORT NÀY ĐỂ GỌI API ĐƯỢC
import axiosClient from '../utils/axiosConfig'; 

const VideoAnalysis = () => {
  const navigate = useNavigate();
  const { sessionId, videoId } = useParams();
  const location = useLocation();
  
  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);

  const passedData = location.state?.videoData;
  // 👇 2. ĐỔI THÀNH STATE ĐỂ CẬP NHẬT ĐƯỢC KHI F5
  const [sessionTitle, setSessionTitle] = useState(location.state?.sessionTitle || "Back to Session");

  const [data, setData] = useState(passedData || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Effect: Xử lý khi user F5
  useEffect(() => {
    if (!data && videoId) {
        const fetchVideo = async () => {
            try {
              const res = await axiosClient.get(`/analyze/${videoId}`);
              if (res.success) {
                  setData(res.data);
                  
                  // 👇 3. CẬP NHẬT LẠI TIÊU ĐỀ TỪ API (Nếu API có trả về session populated)
                  if (res.data.session && res.data.session.title) {
                    setSessionTitle(res.data.session.title);
                  }
              }
            } catch (err) {
              console.error("Lỗi tải video:", err);
              // Nếu lỗi thì quay về danh sách session
              navigate(`/sessions/${sessionId}`); 
            }
        };
        fetchVideo();
    }
  }, [data, videoId, sessionId, navigate]);

  // Effect: Xử lý Video Events

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00"; // Check thêm isNaN
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Hàm cập nhật tiến độ (Gắn vào onTimeUpdate)
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      // Đồng bộ video nền
      if (bgVideoRef.current && Math.abs(bgVideoRef.current.currentTime - video.currentTime) > 0.2) {
         bgVideoRef.current.currentTime = video.currentTime;
      }
    }
  };

  // Hàm cập nhật tổng thời gian (Gắn vào onLoadedMetadata)
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  // Hàm đồng bộ Play/Pause video nền
  const handleVideoPlay = () => {
    setIsPlaying(true);
    if (bgVideoRef.current) bgVideoRef.current.play();
  };
  
  const handleVideoPause = () => {
    setIsPlaying(false);
    if (bgVideoRef.current) bgVideoRef.current.pause();
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || duration === 0) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    if (bgVideoRef.current) bgVideoRef.current.currentTime = newTime;
  };

  const handleBack = () => {
    navigate(`/sessions/${sessionId}`);
  };

  // --- UI RENDER ---

  if (!data) return <div className="video-analysis-loading">Loading data...</div>;

  const videoSrc = data.processedVideoUrl && data.processedVideoUrl.startsWith('http') 
      ? data.processedVideoUrl 
      : `http://localhost:5001${data.processedVideoUrl}`;

  const metrics = data.metrics || {};

  return (
    <div className="video-analysis-container">
      
      {/* 1. Background Layer */}
      <video
        ref={bgVideoRef}
        className="video-backdrop-blur"
        src={videoSrc}
        muted
        loop
        playsInline
      />

      {/* 2. Main Layer */}
      <video
        ref={videoRef}
        className="video-main"
        src={videoSrc}
        onClick={handlePlayPause}
        playsInline
        crossOrigin="anonymous" 

        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
      />

      {/* 3. Overlay */}
      <div className="video-overlay">
        
        <div className="video-header">
          <button className="back-button-video" onClick={handleBack}>
            <FaArrowLeft />
            <span>{sessionTitle}</span> {/* Hiển thị state title */}
          </button>
        </div>

        <div className="stats-panel">
          <div className="stats-content">
            <div className="stats-list">
              <h3 className="panel-title">Analysis Metrics</h3>
              
              <div className="stat-row">
                <span className="stat-label">Band</span>
                <span className="stat-value highlight">{metrics.band || "N/A"}</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">Score</span>
                <span className="stat-value">{metrics.score || 0}</span>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-row">
                <span className="stat-label">Swing Speed</span>
                <span className="stat-value">
                  {metrics.swing_speed ? metrics.swing_speed.toFixed(2) : 0} m/s
                </span>
              </div>

              <div className="stat-row">
                <span className="stat-label">Arm Angle</span>
                <span className="stat-value">
                  {metrics.arm_angle ? metrics.arm_angle.toFixed(1) : 0}°
                </span>
              </div>
            </div>

            <div className="ai-comment-box-video">
              <div className="ai-title-row">
                <FaRobot className="ai-icon-video" />
                <span>AI Coach Advice</span>
              </div>
              <p className="ai-comment-text-video">
                {data.aiAdvice || "Không có lời khuyên chi tiết cho cú đánh này."}
              </p>
            </div>
          </div>
        </div>

        <div className="roi-box-center"></div>
      </div>

      {/* 4. Controls */}
      <div className="video-controls">
        <div className="control-bar">
            
            <button className="play-button" onClick={handlePlayPause}>
              {isPlaying ? <FaPause /> : <FaPlay style={{marginLeft: 2}} />}
            </button>

            {/* Class đã đổi tên để không bị lỗi CSS */}
            <div className="video-progress-container" onClick={handleProgressClick}>
              <div className="video-progress-bg">
                  <div 
                    className="video-progress-fill" 
                    style={{ width: `${(duration > 0 ? (currentTime / duration) * 100 : 0)}%` }}
                  ></div>
              </div>
            </div>

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

        </div>
      </div>
    </div>
  );
};

const formatTime = (timeInSeconds) => {
  if (!timeInSeconds) return "00:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default VideoAnalysis;
