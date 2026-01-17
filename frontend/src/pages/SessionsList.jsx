import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEllipsisH } from 'react-icons/fa';
import { getRecentSessions, createNewSession } from '../services/session.service';
import CreateSessionModal from '../components/CreateSessionModal';
import './SessionsList.css';

const SessionsList = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(false);
            const response = await getRecentSessions(20); // Fetch more items for the list page
            console.log(response);
            setSessions(response.data || []);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setLoading(false);
        }
    };

    const handleCreateSession = async (title, location, thumbnailFile) => {
        try {
            await createNewSession(title, location, thumbnailFile);
            fetchSessions(); // Refresh list
        } catch (err) {
            console.error('Error creating session:', err);
        }
    };

    const handleSessionClick = (sessionId) => {
        navigate(`/sessions/${sessionId}`);
    };

    // Mock data for demo
    const mockSessions = [
        { id: 1, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', thumbnailUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500' },
        { id: 2, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500' },
        { id: 3, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', thumbnailUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=500' },
        { id: 4, title: 'Indoor Arena', time: '7:30 - 2h49', videoCount: 5, score: '###', band: '4-6', thumbnailUrl: 'https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?w=500' },
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
                <div className="session-card-item add-session-card" onClick={() => setIsModalOpen(true)}>
                    <FaPlus className="add-session-icon" />
                </div>

                {/* Existing Sessions */}
                {displaySessions.map((session) => (
                    <div
                        key={session._id || session.id}
                        className="session-card-item"
                        onClick={() => handleSessionClick(session._id || session.id)}
                    >
                        {/* Session Image */}
                        <div className="session-card-image">
                            <img
                                src={
                                    session.thumbnailUrl
                                        ? (session.thumbnailUrl.startsWith('http')
                                            ? session.thumbnailUrl
                                            : `http://localhost:5001${session.thumbnailUrl}`)
                                        : 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500'
                                }
                                alt={session.title}
                            />
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

            <CreateSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateSession}
            />
        </div>
    );
};

export default SessionsList;
