import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEllipsisH } from 'react-icons/fa';
import axiosClient from '../utils/axiosConfig';
import './SessionsList.css';

const SessionsList = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(false);
      const response = await axiosClient.get('/sessions');
      setSessions(response.data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setLoading(false);
    }
  };

  const handleCreateSession = () => {
    navigate('/sessions/create');
  };

  const handleSessionClick = (sessionId) => {
    navigate(`/sessions/${sessionId}`);
  };

  // Mock data for demo
  const mockSessions = [
    { id: 1, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', image: 'https://www.figma.com/api/mcp/asset/7d89c2c2-0529-4044-8f69-f694700872c3' },
    { id: 2, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', image: 'https://www.figma.com/api/mcp/asset/7d89c2c2-0529-4044-8f69-f694700872c3' },
    { id: 3, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', image: 'https://www.figma.com/api/mcp/asset/7d89c2c2-0529-4044-8f69-f694700872c3' },
    { id: 4, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', image: 'https://www.figma.com/api/mcp/asset/7d89c2c2-0529-4044-8f69-f694700872c3' },
  ];

  const displaySessions = sessions.length > 0 ? sessions : mockSessions;

  if (loading) {
    return (
      <div className="sessions-list-container">
        <h1 className="sessions-list-title">Session</h1>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="sessions-list-container">
      <h1 className="sessions-list-title">Session</h1>
      
      <div className="sessions-grid">
        {/* Add New Session Card */}
        <div className="session-card-item add-session-card" onClick={handleCreateSession}>
          <FaPlus className="add-session-icon" />
        </div>

        {/* Existing Sessions */}
        {displaySessions.map((session) => (
          <div 
            key={session.id} 
            className="session-card-item"
            onClick={() => handleSessionClick(session.id)}
          >
            {/* Session Image */}
            <div className="session-card-image">
              <img src={session.image} alt={session.title} />
            </div>

            {/* Session Header */}
            <div className="session-card-header">
              <h3 className="session-card-title">{session.title}</h3>
              <button 
                className="session-options-btn"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <FaEllipsisH />
              </button>
            </div>

            {/* Session Info */}
            <p className="session-card-time">{session.time}</p>
            <p className="session-card-videos">{session.videoCount} videos</p>

            {/* Session Stats */}
            <div className="session-card-stats">
              <span className="session-stat-badge">Score: {session.score}</span>
              <span className="session-stat-badge">Band: {session.band}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionsList;
