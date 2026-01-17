import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoursePageCard from '../components/CoursePageCard';
import './Courses.css';

import { getCourses } from '../services/course.service';

const Courses = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coursesPerPage, setCoursesPerPage] = useState(2);
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [progressData, setProgressData] = useState({});

    useEffect(() => {
        // Fetch courses from API
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const data = await getCourses();
                setCourses(data);

                // Load progress for these courses
                const progress = {};
                data.forEach(course => {
                    // Fallback to localStorage for now, or match ID from DB (which is _id mostly)
                    // If migrating, we might need to handle mapped IDs if IDs changed to ObjectIDs
                    // But let's assume simple ID usage or just keep localStorage pattern
                    const stored = localStorage.getItem(`course_${course._id}_progress`) || localStorage.getItem(`course_${course.id}_progress`);
                    if (stored) {
                        try {
                            progress[course._id] = JSON.parse(stored);
                        } catch (e) {
                            console.error('Error parsing progress', e);
                        }
                    }
                });
                setProgressData(progress);

            } catch (error) {
                console.error("Failed to load courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filter courses based on selected level
    const filteredCourses = selectedLevel === 'All'
        ? courses
        : courses.filter(course => course.category.includes(selectedLevel));

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

    // Reset to first slide when filter changes
    useEffect(() => {
        setCurrentSlide(0);
    }, [selectedLevel]);

    const handlePrevSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : Math.max(0, (filteredCourses?.length || 1) - coursesPerPage)));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleNextSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        const maxSlide = Math.max(0, (filteredCourses?.length || 1) - coursesPerPage);
        setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : 0));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleStartCourse = (courseId) => {
        navigate(`/courses/${courseId}/checklist`);
    };

    const handleFilterChange = (level) => {
        setSelectedLevel(level);
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
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${selectedLevel === 'All' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('All')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${selectedLevel === 'Beginner' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('Beginner')}
                    >
                        Beginner
                    </button>
                    <button
                        className={`filter-btn ${selectedLevel === 'Intermediate' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('Intermediate')}
                    >
                        Intermediate
                    </button>
                    <button
                        className={`filter-btn ${selectedLevel === 'Advanced' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('Advanced')}
                    >
                        Advanced
                    </button>
                </div>
            </div>

            <div className="courses-carousel">
                <button className="carousel-btn prev" onClick={handlePrevSlide} disabled={isTransitioning}>
                    <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                        <path d="M20 4L4 24L20 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="carousel-wrapper">
                    <div
                        className="carousel-content"
                        style={{
                            transform: `translateX(-${currentSlide * (100 / coursesPerPage)}%)`,
                            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                        }}
                    >
                        {filteredCourses && filteredCourses.length > 0 && filteredCourses.map((course) => (
                            <CoursePageCard
                                key={course._id}
                                course={course}
                                progress={progressData[course._id]}
                                onStart={handleStartCourse}
                            />
                        ))}
                    </div>
                </div>

                <button className="carousel-btn next" onClick={handleNextSlide} disabled={isTransitioning}>
                    <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                        <path d="M4 4L20 24L4 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Courses;
