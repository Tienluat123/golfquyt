import axiosClient from '../utils/axiosConfig';

export const getFeaturedCourses = (limit = 3) => {
  return axiosClient.get(`/courses?limit=${limit}`);
};
