import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

/**
 * Hook for pose detection using MediaPipe
 */
export const usePoseDetection = ({ videoRef, canvasRef, onPoseDetected, enabled = true, referencePose = null }) => {
  const [isPoseDetecting, setIsPoseDetecting] = useState(false);
  const [currentPose, setCurrentPose] = useState(null);
  const [poseError, setPoseError] = useState(null);
  const animationFrameRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const referencePoseRef = useRef(referencePose);

  // Update reference pose ref when it changes
  useEffect(() => {
    referencePoseRef.current = referencePose;
  }, [referencePose]);

  // Initialize MediaPipe Pose Detector
  const initializePoseDetector = useCallback(async () => {
    try {
      console.log('🚀 Initializing MediaPipe Pose Detector...');
      setIsPoseDetecting(true);
      setPoseError(null);

      // Load MediaPipe vision tasks
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Create PoseLandmarker
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      poseLandmarkerRef.current = poseLandmarker;
      console.log('✅ MediaPipe Pose Detector initialized successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize pose detector:', error);
      setPoseError(error.message);
      setIsPoseDetecting(false);
      return false;
    }
  }, []);

  // Draw reference pose skeleton on canvas
  const drawReferencePose = useCallback((referencePose, ctx, canvas) => {
    console.log('🎨 drawReferencePose called:', {
      hasReferencePose: !!referencePose,
      hasLandmarks: !!referencePose?.referenceLandmarks,
      landmarkCount: referencePose?.referenceLandmarks?.length || 0,
      hasCtx: !!ctx,
      canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'none'
    });

    if (!referencePose || !referencePose.referenceLandmarks || !ctx) return;

    const landmarks = referencePose.referenceLandmarks;

    // Convert normalized landmarks to canvas coordinates
    const scaledLandmarks = landmarks.map(lm => ({
      x: lm.x * canvas.width,
      y: lm.y * canvas.height,
      z: lm.z || 0,
      visibility: lm.visibility
    }));

    console.log('🎨 Drawing reference skeleton with', scaledLandmarks.length, 'landmarks');
    console.log('Sample landmark:', scaledLandmarks[0]);

    // Draw connections manually
    const connections = [
      // Pose connections (MediaPipe format)
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28] // Legs
    ];

    ctx.strokeStyle = '#2196F3'; // Bright blue
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    connections.forEach(([startIdx, endIdx]) => {
      const start = scaledLandmarks[startIdx];
      const end = scaledLandmarks[endIdx];

      if (start && end && start.visibility > 0.3 && end.visibility > 0.3) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });

    // Draw landmark points
    ctx.fillStyle = '#2196F3'; // Bright blue
    scaledLandmarks.forEach((landmark, idx) => {
      if (landmark && landmark.visibility > 0.3) {
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    console.log('✅ Reference skeleton drawn');
  }, []);

  // Draw pose landmarks on canvas
  const drawPoseLandmarks = useCallback((results, ctx, canvas) => {
    if (!results || !results.landmarks || results.landmarks.length === 0) return;

    const drawingUtils = new DrawingUtils(ctx);

    // Draw landmarks and connectors
    for (const landmarks of results.landmarks) {
      // Draw connectors
      drawingUtils.drawConnectors(
        landmarks,
        PoseLandmarker.POSE_CONNECTIONS,
        { color: '#00FF00', lineWidth: 2 }
      );

      // Draw landmarks
      drawingUtils.drawLandmarks(
        landmarks,
        { color: '#FF0000', fillColor: '#FF0000', radius: 3 }
      );
    }
  }, []);

  // Detect pose from video frame
  const detectPose = useCallback(async (referencePoseParam = null) => {
    if (!videoRef.current || !canvasRef.current || !enabled || !poseLandmarkerRef.current) {
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Only process if video is ready and time has changed
      if (video.readyState < 2 || video.currentTime === lastVideoTimeRef.current) {
        return null;
      }

      lastVideoTimeRef.current = video.currentTime;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detect pose
      const results = poseLandmarkerRef.current.detectForVideo(video, performance.now());

      // Get canvas context
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw reference pose FIRST (so it's behind user's pose)
      if (referencePoseParam && referencePoseParam.referenceLandmarks) {
        drawReferencePose(referencePoseParam, ctx, canvas);
      }

      if (results && results.landmarks && results.landmarks.length > 0) {
        // Get first detected pose
        const landmarks = results.landmarks[0];

        // Convert to our expected format
        const pose = {
          landmarks: landmarks.map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
            visibility: landmark.visibility || 1.0
          })),
          worldLandmarks: results.worldLandmarks ? results.worldLandmarks[0] : [],
          confidence: 0.8
        };

        setCurrentPose(pose);

        // Draw user's pose landmarks on top
        drawPoseLandmarks(results, ctx, canvas);

        if (onPoseDetected) {
          onPoseDetected(pose);
        }

        return pose;
      }

      return null;
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }, [videoRef, canvasRef, enabled, onPoseDetected, drawReferencePose, drawPoseLandmarks]);





  // Start continuous pose detection
  const startPoseDetection = useCallback(async () => {
    if (!enabled) return;

    const initialized = await initializePoseDetector();
    if (!initialized) return;

    const detectLoop = async () => {
      await detectPose(referencePoseRef.current);
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();
  }, [enabled, initializePoseDetector, detectPose]);

  // Stop pose detection
  const stopPoseDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Close pose landmarker
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }

    setIsPoseDetecting(false);
    console.log('🛑 Pose detection stopped');
  }, []);

  // Auto-start pose detection when enabled
  useEffect(() => {
    if (enabled && videoRef?.current?.readyState === 4) {
      const timer = setTimeout(() => {
        startPoseDetection();
      }, 500);

      return () => {
        clearTimeout(timer);
        stopPoseDetection();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    isPoseDetecting,
    currentPose,
    poseError,
    detectPose,
    drawPoseLandmarks,
    drawReferencePose,
    startPoseDetection,
    stopPoseDetection
  };
};

export default usePoseDetection;
