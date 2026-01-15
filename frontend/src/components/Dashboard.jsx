import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBookOpen } from 'react-icons/fa'; // Bỏ FaRegSadTear vì không dùng nữa
import { getUserProfile } from '../services/user.service';
import { getRecentSessions } from '../services/session.service';
import { getFeaturedCourses } from '../services/course.service';
import DashboardHeader from './Dashboard/DashboardHeader';
import ProgressCard from './Dashboard/ProgressCard';
import SessionCard from './Dashboard/SessionCard';
import CourseCard from './Dashboard/CourseCard';
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
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="loading-screen">Đang tải dữ liệu...</div>;
  if (!user) return null;

  return (
    <div className="dashboard-page">
      <DashboardHeader user={user} />
      <ProgressCard user={user} />

      {/* --- GOLF SESSION (ĐÃ SỬA) --- */}
      <section className="section-block">
        <h3>Golf Session</h3>
        
        {/* LUÔN HIỆN GRID, KHÔNG DÙNG IF/ELSE NỮA */}
        <div className="card-grid">
          
          {/* 1. THẺ ADD CARD (Luôn đứng đầu tiên) */}
          <div className="card add-card" onClick={() => navigate('/sessions/create')}>
            {/* Tăng size icon lên 40 cho đẹp và bỏ chữ New Session để giống thiết kế */}
            <FaPlus size={40} /> 
          </div>

          {/* 2. DANH SÁCH SESSION (Nếu có thì hiện tiếp theo) */}
          {sessions && sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>

        {/* (Tùy chọn) Dòng nhắc nhở nhỏ bên dưới nếu chưa có bài tập nào */}
        {(!sessions || sessions.length === 0) && (
           <p style={{ marginTop: '15px', color: '#888', fontSize: '0.9rem' }}>
             * Bấm vào thẻ dấu cộng ở trên để bắt đầu buổi tập đầu tiên.
           </p>
        )}
      </section>

      {/* --- COURSES (GIỮ NGUYÊN HOẶC SỬA TÙY BẠN) --- */}
      {/* Phần Courses thường người dùng không tự tạo khóa học nên giữ logic cũ là hợp lý */}
      <section className="section-block">
         <h3>Courses</h3>
         
         {courses?.length > 0 ? (
           <div className="card-grid">
             {courses.map(course => (
               <CourseCard key={course._id} course={course} />
             ))}
           </div>
         ) : (
           /* Giao diện khi chưa đăng ký khóa học nào */
           <div className="empty-state-box">
             <div className="empty-icon"><FaBookOpen size={30} /></div>
             <p>Chưa có khóa học nào được đăng ký.</p>
             <button className="btn-create-now" onClick={() => navigate('/courses')}>
               Khám phá khóa học
             </button>
           </div>
         )}
      </section>
    </div>
  );
};

export default Dashboard;
