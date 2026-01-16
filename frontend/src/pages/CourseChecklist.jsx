import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CourseChecklist.css';
import COURSE_CHECKLISTS from '../data/courseChecklists';
import { MOCK_COURSES } from './Courses';

const CourseChecklist = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Get course data based on courseId
  const course = MOCK_COURSES.find(c => c.id === parseInt(courseId));
  const checklist = COURSE_CHECKLISTS[parseInt(courseId)] || [];

  // Fallback if course not found
  if (!course) {
    return (
      <div className="course-checklist-page">
        <div className="checklist-header">
          <button className="back-button" onClick={() => navigate('/courses')}>
            <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
              <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 6H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Courses</span>
          </button>
        </div>
        <div className="loading-state">Course not found</div>
      </div>
    );
  }

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
            <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 6H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Courses</span>
        </button>
      </div>

      <div className="checklist-content">
        <div className="checklist-section">
          <h1>Checklist</h1>
          <ul className="checklist-items">
            {checklist.map((item, index) => (
              <li key={index}>
                <strong>{item.stepName}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="course-preview">
          <img src={course.thumbnail} alt={course.title} />
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
