import React, { useEffect, useState } from 'react';
import { FaPlus, FaMapMarkerAlt, FaFlag } from 'react-icons/fa';
import { getUserProfile } from '../services/user.service';
import { getRecentSessions, createNewSession } from '../services/session.service';
import { getCourses } from '../services/course.service';

// Import các Component con đã tách
import SessionCard from './Dashboard/SessionCard';
import CourseCard from './Dashboard/CourseCard';
import ProgressCard from './Dashboard/ProgressCard';
import CreateSessionModal from './CreateSessionModal';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // State cho Modal

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, sessionData, coursesData] = await Promise.all([
                    getUserProfile(),
                    getRecentSessions(3),
                    getCourses()
                ]);

                setUser(userData);
                console.log("Fetched sessions:", sessionData);
                setSessions(sessionData?.data || []);

                // Logical filtering for courses
                const coursesWithProgress = (coursesData || []).map(course => {
                    const hasProgress = localStorage.getItem(`course_${course._id}_progress`);
                    return {
                        ...course,
                        progress: !!hasProgress, // Boolean flag for progress
                        updatedAt: hasProgress ? new Date() : new Date(0) // Mock sort by recent activity if real data existed
                    };
                });

                // Sort: Resumed courses first
                coursesWithProgress.sort((a, b) => {
                    if (a.progress && !b.progress) return -1;
                    if (!a.progress && b.progress) return 1;
                    return 0;
                });

                // Limit to 5
                const limitedCourses = coursesWithProgress.slice(0, 5);

                setCourses(limitedCourses);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Dashboard.js

    const handleCreateSession = async (title, location, thumbnailFile) => { // <--- Thêm tham số này
        try {
            // Hàm createNewSession ở service bây giờ nhận 3 tham số
            const res = await createNewSession(title, location, thumbnailFile);

            if (res.success) {
                setSessions([res.data, ...sessions]);
                setIsModalOpen(false);
            }
        } catch (error) {
            alert("Lỗi: " + error.message);
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="dashboard-container">
            {/* 1. Header Section */}
            <div className="dashboard-header-section">
                <div className="header-content">
                    <h1 className="greeting">Hello, {user?.username || 'Golfer'}!</h1>
                    <div className="location-info">
                        <FaMapMarkerAlt className="location-icon" />
                        <span>{user?.location || 'Vietnam'}</span>
                    </div>
                </div>
            </div>


            {/* 2. Progress Section */}
            <section className="section-block">
                <h3 className="section-title">Your Progress</h3>

                {/* Không cần map, chỉ render 1 lần và truyền USER vào */}
                <div className="card-grid" style={{ display: 'block' }}> {/* display block để nó full width */}
                    {user ? (
                        <ProgressCard user={user} />
                    ) : (
                        <p className="loading-text">Đang tải thông tin thành viên...</p>
                    )}
                </div>
            </section>



            {/* 3. Golf Session Section */}
            <section className="section-block">
                <h3 className="section-title">Golf Session</h3>
                <div className="card-grid">

                    {/* Nút dấu cộng mở Modal */}
                    <div className="session-card add-card" onClick={() => setIsModalOpen(true)}>
                        <FaPlus className="add-icon" />
                    </div>

                    {/* Render List Session */}
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <SessionCard key={session._id} session={session} />
                        ))
                    ) : (
                        <p className="empty-text">Chưa có buổi tập nào. Bấm dấu + để tạo mới!</p>
                    )}
                </div>
            </section>

            {/* 4. Courses Section */}
            <section className="section-block">
                <h3 className="section-title">Courses</h3>
                <div className="card-grid">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))
                    ) : (
                        <p className="empty-text">Chưa có khóa học nào.</p>
                    )}
                </div>
            </section>

            {/* 5. Modal Component */}
            <CreateSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateSession}
            />
        </div>
    );
};

export default Dashboard;
