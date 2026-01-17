import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisH } from 'react-icons/fa';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const hasProgress = course.progress;
  const buttonText = hasProgress ? 'Resume' : 'Start Course';

  const handleStartCourse = () => {
    navigate(`/courses/${course.id}/checklist`);
  };

  return (
    <div className={`course-card ${hasProgress ? 'course-card--resumed' : ''}`}>
      <div className="course-card__header">
        <h4 className="course-card__title">{course.title}</h4>
        <FaEllipsisH className="course-card__menu" />
      </div>

      <div className="course-card__body">
        <p className="course-card__videos">{course.lessons || 5} videos</p>
      </div>

      <div className="course-card__footer">
        <button
          className={`course-card__btn ${hasProgress ? 'course-card__btn--resume' : ''}`}
          onClick={handleStartCourse}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
