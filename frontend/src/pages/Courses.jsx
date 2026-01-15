import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

// Mock data for courses
const MOCK_COURSES = [
  {
    id: 1,
    title: 'Backswing Actions',
    category: 'Tutorial',
    thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500',
    description: 'Master the fundamentals of backswing technique',
    duration: '15 min',
    lessons: 5
  },
  {
    id: 2,
    title: 'Downswing Mechanics',
    category: 'Tutorial',
    thumbnail: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500',
    description: 'Perfect your downswing for maximum power',
    duration: '20 min',
    lessons: 7
  },
  {
    id: 3,
    title: 'Follow Through',
    category: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500',
    description: 'Complete your swing with proper follow through',
    duration: '12 min',
    lessons: 4
  }
];

const Courses = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [loading, setLoading] = useState(false);
  const [coursesPerPage, setCoursesPerPage] = useState(2);

  useEffect(() => {
    // Use mock data - no API call needed
    setCourses(MOCK_COURSES);
  }, []);

  // Calculate courses per page based on screen size
  useEffect(() => {
    const updateCoursesPerPage = () => {
      const width = window.innerWidth;
      if (width < 900) {
        setCoursesPerPage(1);
      } else if (width < 1400) {
        setCoursesPerPage(2);
      } else if (width < 2000) {
        setCoursesPerPage(3);
      } else {
        setCoursesPerPage(4);
      }
    };

    updateCoursesPerPage();
    window.addEventListener('resize', updateCoursesPerPage);
    return () => window.removeEventListener('resize', updateCoursesPerPage);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : (courses?.length || 1) - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev < (courses?.length || 1) - 1 ? prev + 1 : 0));
  };

  const handleStartCourse = (courseId) => {
    navigate(`/courses/${courseId}/checklist`);
  };

  if (loading) {
    return (
      <div className="courses-page">
        <div className="courses-header">
          <h1>Courses</h1>
        </div>
        <div className="loading-state">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Courses</h1>
      </div>

      <div className="courses-carousel">
        <button className="carousel-btn prev" onClick={handlePrevSlide}>
          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
            <path d="M20 4L4 24L20 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="carousel-content">
          {courses && courses.length > 0 && courses.slice(currentSlide, currentSlide + coursesPerPage).map((course, index) => (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-overlay">
                  <span className="course-category">{course.category}</span>
                  <button className="play-button">
                    <svg width="53" height="53" viewBox="0 0 53 53" fill="none">
                      <circle cx="26.5" cy="26.5" r="26.5" fill="white" fillOpacity="0.8"/>
                      <path d="M21 17L35 26.5L21 36V17Z" fill="#075b1f"/>
                    </svg>
                  </button>
                  <h3 className="course-title">{course.title}</h3>
                </div>
              </div>
              <div className="course-footer">
                <button 
                  className="start-course-btn"
                  onClick={() => handleStartCourse(course.id)}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M4 8L4 20L8 24H20L24 20V8L20 4H8L4 8Z" stroke="white" strokeWidth="2"/>
                  </svg>
                  Start Course
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn next" onClick={handleNextSlide}>
          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
            <path d="M4 4L20 24L4 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Courses;
