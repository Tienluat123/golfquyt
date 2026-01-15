import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5001', // Đường dẫn gốc của Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const userStorage = localStorage.getItem('user');
    
    if (userStorage) {
      const { token } = JSON.parse(userStorage);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosClient.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
