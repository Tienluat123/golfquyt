import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for camera and pose detection
 * @param {Object} options - Configuration options
 * @param {boolean} options.enablePoseDetection - Enable pose detection
 * @param {Function} options.onPoseDetected - Callback when pose is detected
 * @returns {Object} Camera state and controls
 */
export const useCamera = ({ enablePoseDetection = false, onPoseDetected = null } = {}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const animationFrameRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Unable to access camera');
      setHasPermission(false);
      setIsLoading(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [stream]);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Check if user is in bounding box
  const checkBoundingBox = useCallback((pose, boxConfig) => {
    if (!pose) return false;

    const { x, y, width, height } = boxConfig;
    
    // Check if key pose landmarks are within the bounding box
    const keyLandmarks = ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'];
    
    let landmarksInBox = 0;
    keyLandmarks.forEach(landmark => {
      if (pose[landmark]) {
        const lx = pose[landmark].x;
        const ly = pose[landmark].y;
        
        if (lx >= x && lx <= x + width && ly >= y && ly <= y + height) {
          landmarksInBox++;
        }
      }
    });

    // User is in box if at least 3 key landmarks are inside
    return landmarksInBox >= 3;
  }, []);

  // Draw bounding box on canvas
  const drawBoundingBox = useCallback((ctx, boxConfig, isUserInBox = false) => {
    const { x, y, width, height } = boxConfig;
    
    ctx.strokeStyle = isUserInBox ? '#00ff00' : '#e51919';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await startCamera();
      }
    };
    
    init();

    return () => {
      mounted = false;
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef,
    canvasRef,
    stream,
    isLoading,
    error,
    hasPermission,
    startCamera,
    stopCamera,
    captureFrame,
    checkBoundingBox,
    drawBoundingBox
  };
};

export default useCamera;
