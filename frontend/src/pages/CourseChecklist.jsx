import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CourseChecklist.css';

const CourseChecklist = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Sample checklist data - replace with actual API call based on courseId
  const courseData = {
    title: 'Backswing Actions',
    checklist: [
      {
        title: 'Takeaway',
        description: 'Move the club back slowly by coordinating your shoulders and arms, ensuring the clubface does not close or open too early.'
      },
      {
        title: 'Shoulder Turn',
        description: 'For right-handed golfers, the left shoulder should rotate under the chin, creating torque in the core area.'
      },
      {
        title: 'Width Control',
        description: 'Keep your lead arm (left arm) straight but not rigid to create the widest possible swing arc.'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800'
  };

  const handleStart = () => {
    navigate(`/courses/${courseId}/training/1`);
  };

  const handleBack = () => {
    navigate('/courses');
  };

  return (
    <div className="course-checklist-page">
      <div className="checklist-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
            <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 6H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Courses</span>
        </button>
      </div>

      <div className="checklist-content">
        <div className="checklist-section">
          <h1>Checklist</h1>
          <ul className="checklist-items">
            {courseData.checklist.map((item, index) => (
              <li key={index}>
                <strong>{item.title}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="course-preview">
          <img src={courseData.thumbnail} alt={courseData.title} />
        </div>
      </div>

      <div className="checklist-footer">
        <button className="start-training-btn" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  );
};

export default CourseChecklist;
