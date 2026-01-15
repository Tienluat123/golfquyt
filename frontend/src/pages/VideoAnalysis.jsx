import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaPlay, FaPause } from 'react-icons/fa';
import './VideoAnalysis.css';

const VideoAnalysis = () => {
  const navigate = useNavigate();
  const { sessionId, videoId } = useParams();
  const videoRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Mock video data - replace with API call
  const videoData = {
    id: videoId,
    sessionTitle: 'Indoor Arena',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Replace with actual video
    thumbnail: 'https://via.placeholder.com/1440x900/87CEEB/ffffff?text=Golf+Swing+Video',
    stats: {
      band: '4-6',
      score: 90,
      speed: 90,
      wristRotation: 90,
      hipRotation: 90
    },
    aiComment: 'Your backswing shows good rotation, but try to keep your left arm straighter during the downswing.',
    // Phase markers (in seconds) - marks key points in the swing
    phases: [
      { time: 2.5, label: 'Address', color: '#ff2c2c' },
      { time: 5.0, label: 'Backswing', color: '#ff2c2c' },
      { time: 7.5, label: 'Impact', color: '#ff2c2c' },
      { time: 10.0, label: 'Follow-through', color: '#ff2c2c' }
    ]
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
  };

  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging) {
      handleProgressClick(e);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging]);

  const handleBack = () => {
    navigate(`/sessions/${sessionId}`);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-analysis-container">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="video-background"
        poster={videoData.thumbnail}
        onClick={handlePlayPause}
      >
        <source src={videoData.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="video-overlay">
        {/* Back Button */}
        <div className="video-header">
          <button className="back-button-video" onClick={handleBack}>
            <FaArrowLeft />
            <span>{videoData.sessionTitle}</span>
          </button>
        </div>

        {/* Stats Panel */}
        <div className="stats-panel">
          <div className="stats-content">
            <div className="stats-list">
              <p className="stat-item">Band: {videoData.stats.band}</p>
              <p className="stat-item">Score: {videoData.stats.score}</p>
              <div className="stat-divider"></div>
              <p className="stat-item">Speed: {videoData.stats.speed}</p>
              <p className="stat-item">Wrist Rotation: {videoData.stats.wristRotation}</p>
              <p className="stat-item">Hip Rotation: {videoData.stats.hipRotation}</p>
            </div>

            {/* AI Comment Box */}
            <div className="ai-comment-box-video">
              <FaRobot className="ai-icon-video" />
              <p className="ai-comment-text-video">{videoData.aiComment}</p>
            </div>
          </div>
        </div>

        {/* Region of Interest Overlay (Red Dashed Box) */}
        <div className="roi-box"></div>
      </div>

      {/* Video Controls */}
      <div className="video-controls">
        {/* Progress Bar */}
        <div 
          className="progress-bar-container"
          onMouseDown={handleProgressMouseDown}
        >
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Phase Markers */}
          {videoData.phases.map((phase, index) => (
            <div
              key={index}
              className="phase-marker"
              style={{ 
                left: `${(phase.time / duration) * 100}%`,
                backgroundColor: phase.color
              }}
              title={phase.label}
            ></div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="control-bar">
          <button className="play-button" onClick={handlePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <span className="time-display">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
