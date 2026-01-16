import axiosClient from '../utils/axiosConfig';

export const getRecentSessions = (limit = 3) => {
  return axiosClient.get(`/sessions?limit=${limit}`);
};

export const createNewSession = (title, location, thumbnailFile) => {
  const formData = new FormData();
  
  formData.append('title', title);
  formData.append('location', location || "");
  
  // Kiểm tra kỹ: thumbnailFile phải là File object (lấy từ e.target.files[0])
  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }

  return axiosClient.post('/sessions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
};
