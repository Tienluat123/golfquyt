import React from 'react';
import { FaEllipsisH } from 'react-icons/fa';

const CourseCard = ({ course }) => {
  return (
    <div className="card course-card">
      <div className="card-header">
        <h4>{course.title}</h4>
        <FaEllipsisH className="icon-menu" />
      </div>
      
      <div className="card-body">
         <p className="video-count">{course.level || 'Intermediate'}</p> 
      </div>

      <button className="course-btn">Start Course</button>
    </div>
  );
};

export default CourseCard;
