import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/auth.service';
import './Auth.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const { username, email, password } = formData;

  // Hàm xử lý khi gõ vào ô input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- XỬ LÝ ĐĂNG KÝ ---
  const handleRegister = async (e) => {
    e.preventDefault(); // Chặn reload trang
    try {
      await registerUser({ username, email, password });
      
      // Chuyển hiệu ứng sang form Login
      setIsSignUp(false); 
      // Reset form
      setFormData({ username: '', email: '', password: '' });
    } catch (error) {
      console.error(error);
    }
  };

  // --- XỬ LÝ ĐĂNG NHẬP ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ email, password });
      
      // Chuyển hướng về trang chủ (hoặc Dashboard) sau 1 giây
      setTimeout(() => {
        navigate('/dashboard'); 
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="auth-page">
      <div className="header-wrapper">
        <Header />
      </div>

      <div className="auth-container-wrapper">
        {/* Dùng class 'auth-box' đã sửa */}
        <div className={`auth-box ${isSignUp ? "right-panel-active" : ""}`} id="container">
          
          {/* --- FORM ĐĂNG KÝ --- */}
          <div className="form-container sign-up-container">
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <div className="social-container">
                <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
              </div>
              <span>or use your email for registration</span>
              
              <input 
                type="text" 
                placeholder="Name" 
                name="username" 
                value={username} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                name="email" 
                value={email} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                value={password} 
                onChange={handleChange} 
                required 
              />
              <button className="btn-auth" type="submit">Sign Up</button>
            </form>
          </div>

          {/* --- FORM ĐĂNG NHẬP --- */}
          <div className="form-container sign-in-container">
            <form onSubmit={handleLogin}>
              <h1>Sign in</h1>
              <div className="social-container">
                <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
              </div>
              <span>or use your account</span>
              
              <input 
                type="email" 
                placeholder="Email" 
                name="email" 
                value={email} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                value={password} 
                onChange={handleChange} 
                required 
              />
              <a href="#">Forgot your password?</a>
              <button className="btn-auth" type="submit">Sign In</button>
            </form>
          </div>

          {/* --- OVERLAY --- */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="btn-auth ghost" onClick={() => setIsSignUp(false)}>Sign In</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Golfer!</h1>
                <p>Enter your personal details and start your journey with us</p>
                <button className="btn-auth ghost" onClick={() => setIsSignUp(true)}>Sign Up</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
