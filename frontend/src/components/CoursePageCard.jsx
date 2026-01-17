import React from 'react';
import './CoursePageCard.css';

const CoursePageCard = ({ course, progress, onStart }) => {
    return (
        <div className="course-page-card">
            <div className="course-page-thumbnail">
                <img src={course.thumbnailUrl || course.thumbnail} alt={course.title} />
                <div className="course-page-overlay">
                    <span className="course-page-category">{course.category}</span>
                    <button className="course-page-play-btn">
                        <svg width="53" height="53" viewBox="0 0 53 53" fill="none">
                            <circle cx="26.5" cy="26.5" r="26.5" fill="white" fillOpacity="0.8" />
                            <path d="M21 17L35 26.5L21 36V17Z" fill="#075b1f" />
                        </svg>
                    </button>
                    <h3 className="course-page-title">{course.title}</h3>
                </div>
            </div>
            <div className="course-page-footer">
                <button
                    className="course-page-start-btn"
                    onClick={() => onStart(course._id || course.id)}
                >
                    {progress ? 'Resume' : 'Start Course'}
                </button>
            </div>
        </div>
    );
};

export default CoursePageCard;
