import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CourseComplete.css';

const CourseComplete = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  const handleRetry = () => {
    navigate(`/courses/${courseId}/training/1`);
  };

  return (
    <div className="course-complete-page">
      <div className="complete-card">
        <div className="complete-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="60" fill="#075b1f" opacity="0.2"/>
            <circle cx="60" cy="60" r="45" stroke="#075b1f" strokeWidth="6"/>
            <path d="M35 60L52 77L85 44" stroke="#075b1f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1>Course Completed!</h1>
        
        <p className="complete-message">
          Congratulations! You've successfully completed the course.
          Keep practicing to improve your golf swing.
        </p>

        <div className="complete-actions">
          <button className="btn-primary" onClick={handleBackToCourses}>
            Back to Courses
          </button>
          <button className="btn-secondary" onClick={handleRetry}>
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseComplete;
