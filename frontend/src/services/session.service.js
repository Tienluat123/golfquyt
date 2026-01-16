import axiosClient from '../utils/axiosConfig';

export const getRecentSessions = (limit = 3) => {
  return axiosClient.get(`/sessions?limit=${limit}`);
};

export const createNewSession = (title, location) => {
  return axiosClient.post('/sessions', { 
    title, 
    location 
  });
};
