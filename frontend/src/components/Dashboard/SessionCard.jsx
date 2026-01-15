import React from 'react';
import { FaEllipsisH } from 'react-icons/fa';

const SessionCard = ({ session }) => {
  return (
    <div className="card session-card">
      <div className="card-header">
        <h4>{session.title}</h4>
        <FaEllipsisH className="icon-menu" />
      </div>
      
      <div className="card-body">
        <p className="time">{new Date(session.date).toLocaleDateString()}</p>
        <p className="video-count">{session.videoCount} videos</p>
      </div>

      <div className="card-stats">
        <span className="badge score">Score: {session.score}</span>
        <span className="badge band">Band: {session.band}</span>
      </div>
    </div>
  );
};

export default SessionCard;
