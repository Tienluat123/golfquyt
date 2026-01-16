import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoursePageCard from '../components/CoursePageCard';
import './Courses.css';

// Mock data for courses
export const MOCK_COURSES = [
  {
    id: 1,
    title: "Setup Fundamentals",
    category: "Setup · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500",
    description: "Build a solid foundation with proper stance and posture.",
    duration: "12 min",
    lessons: 4
  },
  {
    id: 2,
    title: "Balanced Setup Position",
    category: "Setup · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500",
    description: "Refine your setup for consistency and power.",
    duration: "18 min",
    lessons: 6
  },
  {
    id: 3,
    title: "Advanced Setup Optimization",
    category: "Setup · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1592919505780-303950717480?w=500",
    description: "Master precise setup adjustments for different shots.",
    duration: "22 min",
    lessons: 7
  },
  {
    id: 4,
    title: "Takeaway Basics",
    category: "Takeaway · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?w=500",
    description: "Learn the first move in a successful golf swing.",
    duration: "14 min",
    lessons: 4
  },
  {
    id: 5,
    title: "Connected Takeaway Motion",
    category: "Takeaway · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500",
    description: "Develop a synchronized one-piece takeaway.",
    duration: "19 min",
    lessons: 6
  },
  {
    id: 6,
    title: "Precision Takeaway Control",
    category: "Takeaway · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500",
    description: "Perfect your takeaway path for optimal swing plane.",
    duration: "23 min",
    lessons: 8
  },
  {
    id: 7,
    title: "Backswing Fundamentals",
    category: "Backswing · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1592919505780-303950717480?w=500",
    description: "Learn a stable and repeatable backswing motion.",
    duration: "15 min",
    lessons: 5
  },
  {
    id: 8,
    title: "Dynamic Backswing Loading",
    category: "Backswing · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?w=500",
    description: "Build coil and power in your backswing turn.",
    duration: "20 min",
    lessons: 7
  },
  {
    id: 9,
    title: "Elite Backswing Mechanics",
    category: "Backswing · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500",
    description: "Master professional-level backswing positions.",
    duration: "24 min",
    lessons: 8
  },
  {
    id: 10,
    title: "Transition Timing Basics",
    category: "Transition · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500",
    description: "Understand the critical shift from backswing to downswing.",
    duration: "13 min",
    lessons: 4
  },
  {
    id: 11,
    title: "Smooth Transition Sequence",
    category: "Transition · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1592919505780-303950717480?w=500",
    description: "Develop proper sequencing for power transfer.",
    duration: "19 min",
    lessons: 6
  },
  {
    id: 12,
    title: "Advanced Transition Dynamics",
    category: "Transition · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?w=500",
    description: "Perfect the transition for maximum clubhead speed.",
    duration: "23 min",
    lessons: 7
  },
  {
    id: 13,
    title: "Downswing Essentials",
    category: "Downswing · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500",
    description: "Build a consistent downswing path.",
    duration: "16 min",
    lessons: 5
  },
  {
    id: 14,
    title: "Powerful Downswing Sequence",
    category: "Downswing · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500",
    description: "Improve speed and accuracy through proper mechanics.",
    duration: "21 min",
    lessons: 7
  },
  {
    id: 15,
    title: "Tour-Level Downswing",
    category: "Downswing · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1592919505780-303950717480?w=500",
    description: "Master elite downswing patterns for consistency.",
    duration: "25 min",
    lessons: 8
  },
  {
    id: 16,
    title: "Impact Position Basics",
    category: "Impact · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?w=500",
    description: "Learn the key positions at the moment of truth.",
    duration: "14 min",
    lessons: 4
  },
  {
    id: 17,
    title: "Solid Impact Control",
    category: "Impact · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500",
    description: "Achieve consistent ball striking through impact.",
    duration: "20 min",
    lessons: 6
  },
  {
    id: 18,
    title: "Professional Impact Mastery",
    category: "Impact · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500",
    description: "Perfect impact dynamics for tour-quality strikes.",
    duration: "24 min",
    lessons: 8
  },
  {
    id: 19,
    title: "Follow Through Foundation",
    category: "Follow Through · Beginner",
    thumbnail: "https://images.unsplash.com/photo-1592919505780-303950717480?w=500",
    description: "Complete your swing with a balanced finish.",
    duration: "12 min",
    lessons: 3
  },
  {
    id: 20,
    title: "Extended Follow Through",
    category: "Follow Through · Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1566204773863-cf63e6d4ab88?w=500",
    description: "Develop a full, powerful finish position.",
    duration: "18 min",
    lessons: 5
  },
  {
    id: 21,
    title: "Complete Follow Through Mechanics",
    category: "Follow Through · Advanced",
    thumbnail: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500",
    description: "Master the complete follow through for maximum distance.",
    duration: "22 min",
    lessons: 7
  }
];

const Courses = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [loading, setLoading] = useState(false);
  const [coursesPerPage, setCoursesPerPage] = useState(2);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    // Use mock data - no API call needed
    setCourses(MOCK_COURSES);

    // Load progress from localStorage
    const progress = {};
    MOCK_COURSES.forEach(course => {
      const stored = localStorage.getItem(`course_${course.id}_progress`);
      if (stored) {
        try {
          progress[course.id] = JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing progress', e);
        }
      }
    });
    setProgressData(progress);
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
                key={course.id}
                course={course}
                progress={progressData[course.id]}
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
