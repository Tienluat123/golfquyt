import { useState, useRef, useEffect } from 'react';
import { analyzeVideo } from '../services/api';

export const useGolfAnalysis = () => {
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [videoSrc, setVideoSrc] = useState(null);
  const [loadingText, setLoadingText] = useState('Đang khởi động...');
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null); // Thêm state quản lý lỗi

  // Dùng ref để giữ interval ID, giúp clear dễ dàng
  const progressIntervalRef = useRef(null);

  // Hàm dọn dẹp interval
  const clearProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Cleanup khi component unmount (tránh lỗi React)
  useEffect(() => {
    return () => clearProgress();
  }, []);

  const processVideo = async (file) => {
    if (!file) return;

    // 1. Reset trạng thái
    setStatus('uploading');
    setProgress(0);
    setLoadingText('Đang tải video lên server...');
    setAnalysisResult(null);
    setVideoSrc(null);
    setError(null);

    try {
      // 2. Chạy thanh Progress giả lập (Thông minh hơn)
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          // Giai đoạn đầu (Upload): Tăng nhanh
          if (prev < 30) return prev + 5;
          // Giai đoạn giữa (AI xử lý): Tăng chậm lại
          if (prev < 70) {
             setLoadingText('AI đang vẽ xương & phân tích...');
             setStatus('processing');
             return prev + 2;
          }
          // Giai đoạn cuối: Nhích từng chút một đợi server
          if (prev < 95) return prev + 0.5;
          return prev;
        });
      }, 500); // Cập nhật mỗi 0.5s

      // 3. Gọi API (Bất đồng bộ)
      const { result, videoUrl } = await analyzeVideo(file);

      // 4. Khi API trả về thành công
      setProgress(100);
      setAnalysisResult(result);
      setVideoSrc(videoUrl);
      setStatus('done');
      setLoadingText('Hoàn tất!');

    } catch (err) {
      console.error('Lỗi xử lý:', err);
      setError(err.message || 'Có lỗi xảy ra khi kết nối server.');
      setStatus('error');
    } finally {
      // Luôn luôn dọn dẹp interval dù thành công hay thất bại
      clearProgress();
    }
  };

  const resetAnalysis = () => {
    setStatus('idle');
    setVideoSrc(null);
    setAnalysisResult(null);
    setProgress(0);
    setError(null);
    setLoadingText('Sẵn sàng');
    clearProgress();
  };

  return {
    status,
    videoSrc,
    loadingText,
    progress,
    analysisResult,
    error,          // Trả về lỗi để UI hiển thị
    processVideo,
    resetAnalysis
  };
};
