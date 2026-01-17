
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CourseChecklist.css';
import { getCourseById } from '../services/course.service';

const CourseChecklist = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const data = await getCourseById(courseId);
                setCourse(data);
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    // Fallback if course not found or loading
    if (loading) {
        return <div className="course-checklist-page"><div className="loading-state">Loading...</div></div>;
    }

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

    const checklist = course.checklist || [];

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
                    <img src={course.thumbnailUrl || course.thumbnail} alt={course.title} />
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
