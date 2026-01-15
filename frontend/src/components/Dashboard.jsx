import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMapMarkerAlt, FaEllipsisH, FaFlag } from 'react-icons/fa';
import { getUserProfile } from '../services/user.service';
import { getRecentSessions } from '../services/session.service';
import { getFeaturedCourses } from '../services/course.service';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, sessionData, courseData] = await Promise.all([
          getUserProfile(),
          getRecentSessions(3),
          getFeaturedCourses(3)
        ]);
        setUser(userData);
        setSessions(sessionData || []); 
        setCourses(courseData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">Loading...</div>
      </div>
    );
  }

  const userName = user?.name || 'Alex Nguyen';
  const userLocation = user?.location || 'Ho Chi Minh city, Vietnam';

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header-section">
        <div className="header-content">
          <h1 className="greeting">Hello, {userName}!</h1>
          <div className="location-wrapper">
            <div className="location-info">
              <FaMapMarkerAlt className="location-icon" />
              <span className="location-text">{userLocation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card - Master of Golf */}
      <div className="progress-section">
        <div className="progress-card">
          <h2 className="progress-title">Master of Golf</h2>
          <div className="progress-bar-wrapper">
            <div className="progress-bar-container">
              <div className="progress-segment red"></div>
              <div className="progress-segment orange"></div>
              <div className="progress-segment yellow">
                <div className="flag-marker">
                  <FaFlag className="flag-icon" />
                </div>
              </div>
              <div className="progress-segment green"></div>
              <div className="progress-segment blue"></div>
              <div className="progress-segment purple"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Golf Session Section */}
      <section className="section-block">
        <h3 className="section-title">Golf Session</h3>
        <div className="card-grid">
          {/* Add New Session Card */}
          <div className="session-card add-card" onClick={() => navigate('/sessions/create')}>
            <div className="add-icon-wrapper">
              <FaPlus className="add-icon" />
            </div>
          </div>

          {/* Session Cards */}
          {sessions && sessions.length > 0 ? (
            sessions.map((session, index) => (
              <div key={session.id || index} className="session-card" onClick={() => navigate(`/sessions/${session.id || index + 1}`)}>
                <div className="card-header">
                  <h4 className="card-title">{session.title || 'Indoor Arena'}</h4>
                  <button className="options-btn" onClick={(e) => { e.stopPropagation(); }}>
                    <FaEllipsisH />
                  </button>
                </div>
                <p className="card-time">{session.time || '7:30 - 2h49'}</p>
                <p className="card-videos">{session.videoCount || 5} videos</p>
                <div className="card-badges">
                  <span className="badge">Score: {session.score || '###'}</span>
                  <span className="badge">Band: {session.band || '4-6'}</span>
                </div>
              </div>
            ))
          ) : (
            // Placeholder cards
            <>
              <div className="session-card" onClick={() => navigate('/sessions/1')}>
                <div className="card-header">
                  <h4 className="card-title">Indoor Arena</h4>
                  <button className="options-btn" onClick={(e) => { e.stopPropagation(); }}><FaEllipsisH /></button>
                </div>
                <p className="card-time">7:30 - 2h49</p>
                <p className="card-videos">5 videos</p>
                <div className="card-badges">
                  <span className="badge">Score: ###</span>
                  <span className="badge">Band: 4-6</span>
                </div>
              </div>
              <div className="session-card" onClick={() => navigate('/sessions/2')}>
                <div className="card-header">
                  <h4 className="card-title">Indoor Arena</h4>
                  <button className="options-btn" onClick={(e) => { e.stopPropagation(); }}><FaEllipsisH /></button>
                </div>
                <p className="card-time">7:30 - 2h49</p>
                <p className="card-videos">5 videos</p>
                <div className="card-badges">
                  <span className="badge">Score: ###</span>
                  <span className="badge">Band: 4-6</span>
                </div>
              </div>
              <div className="session-card" onClick={() => navigate('/sessions/3')}>
                <div className="card-header">
                  <h4 className="card-title">Indoor Arena</h4>
                  <button className="options-btn" onClick={(e) => { e.stopPropagation(); }}><FaEllipsisH /></button>
                </div>
                <p className="card-time">7:30 - 2h49</p>
                <p className="card-videos">5 videos</p>
                <div className="card-badges">
                  <span className="badge">Score: ###</span>
                  <span className="badge">Band: 4-6</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section className="section-block">
        <h3 className="section-title">Courses</h3>
        <div className="card-grid">
          {courses && courses.length > 0 ? (
            courses.map((course, index) => (
              <div key={course._id || index} className={`course-card ${course.status}`} onClick={() => navigate(`/courses/${course._id}`)}>
                <div className="card-header">
                  <h4 className="card-title">{course.title || 'Backswing Action'}</h4>
                  <button className="options-btn" onClick={(e) => { e.stopPropagation(); }}>
                    <FaEllipsisH />
                  </button>
                </div>
                <p className="card-videos">{course.videoCount || 5} videos</p>
                <div className="card-badges">
                  <span className={`badge course-${course.status || 'start'}`}>
                    {course.status === 'inprogress' ? 'Resume' : course.status === 'completed' ? 'Review' : 'Start Courses'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            // Placeholder course cards
            <>
              <div className="course-card start">
                <div className="card-header">
                  <h4 className="card-title">Backswing Action</h4>
                  <button className="options-btn"><FaEllipsisH /></button>
                </div>
                <p className="card-videos">5 videos</p>
                <div className="card-badges">
                  <span className="badge course-start">Start Courses</span>
                </div>
              </div>
              <div className="course-card inprogress">
                <div className="card-header">
                  <h4 className="card-title">Backswing Action</h4>
                  <button className="options-btn"><FaEllipsisH /></button>
                </div>
                <p className="card-videos">5 videos</p>
                <div className="card-badges">
                  <span className="badge course-inprogress">Resume</span>
                </div>
              </div>
              <div className="course-card completed">
                <div className="card-header">
                  <h4 className="card-title">Backswing Action</h4>
                  <button className="options-btn"><FaEllipsisH /></button>
                </div>
                <p className="card-videos">5 videos</p>
                <div className="card-badges">
                  <span className="badge course-completed">Review</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
