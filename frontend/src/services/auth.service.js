
import axiosClient from '../utils/axiosConfig';


// Đăng ký
export const registerUser = async (userData) => {
  return await axiosClient.post('/auth/register', userData);
};

export const loginUser = async (userData) => {
  const data = await axiosClient.post('/auth/login', userData);
  
  if (data.token) {
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('user');
};


export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};
