// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Import Pages
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth'; // Trang Login/Register chung
import Dashboard from './components/Dashboard';

// Giả sử có thêm trang Courses
const CoursesPage = () => <div>Trang khóa học</div>;

function App() {
  return (
    <Router>
      <Routes>
        
        {/* --- NHÓM 1: PUBLIC (Có Header, Footer) --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* Thêm các trang public khác nếu có: About, Contact... */}
        </Route>


        {/* --- NHÓM 2: AUTH (Độc lập, không Header/Footer/Sidebar) --- */}
        <Route path="/login" element={<Auth />} />


        {/* --- NHÓM 3: PRIVATE (Có Sidebar, không Header cũ) --- */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/sessions" element={<div>Trang Session</div>} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
