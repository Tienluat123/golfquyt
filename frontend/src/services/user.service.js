import axiosClient from '../utils/axiosConfig';

export const getUserProfile = () => {
  return axiosClient.get('/users/me');
};
