import axiosClient from '../utils/axiosConfig';

export const analyzeVideo = (formData) => {
  return axiosClient.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
