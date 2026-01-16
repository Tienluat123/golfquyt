import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetection } from '../hooks/usePoseDetection';
import './CourseTraining.css';

const CourseTraining = () => {
  const navigate = useNavigate();
  const { courseId, stepId } = useParams();
  const { videoRef, canvasRef, isLoading, error } = useCamera();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUserInBox, setIsUserInBox] = useState(false);

  // Enable pose detection (disabled for now to avoid conflicts)
  const { currentPose, isPoseDetecting } = usePoseDetection({
    videoRef,
    canvasRef,
    enabled: false, // Disabled until camera is working properly
    onPoseDetected: (pose) => {
      // Handle pose detection
      console.log('Pose detected:', pose);
    }
  });

  // Training steps data
  const trainingSteps = [
    {
      id: 1,
      instruction: 'Before starting, you need to stand inside the bounding box'
    },
    {
      id: 2,
      instruction: 'Next to ......, you need to ...... the line ..........................dfkdsjfhskfjsfs'
    },
    {
      id: 3,
      instruction: 'Follow through with your swing motion'
    }
  ];

  useEffect(() => {
    const step = parseInt(stepId) || 1;
    setCurrentStep(step);
  }, [stepId]);

  // Pause/stop video when page is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      } else if (!document.hidden && videoRef.current && videoRef.current.srcObject) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [videoRef]);

  const handleBack = () => {
    videoRef.current && videoRef.current.pause();
    navigate(`/courses/${courseId}/checklist`);
   
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= trainingSteps.length) {
      navigate(`/courses/${courseId}/training/${nextStep}`);
    } else {
      // Course completed
      navigate(`/courses/${courseId}/complete`);
    }
  };

  const currentInstruction = trainingSteps[currentStep - 1]?.instruction || '';

  return (
    <div className="course-training-page">
      {error && (
        <div className="camera-error">
          <p>Camera Error: {error}</p>
          <button onClick={handleBack}>Go Back</button>
        </div>
      )}
      
      {isLoading && (
        <div className="camera-loading">
          <p>Loading camera...</p>
        </div>
      )}

      <div className="training-video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="training-video"
        />
        <canvas
          ref={canvasRef}
          className="training-canvas"
        />
        
        {/* Bounding box overlay */}
        <div className="bounding-box"></div>

        {/* Back button */}
        <button className="training-back-button" onClick={handleBack}>
          <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
            <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 6H27" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Instruction text */}
      <div className="training-instruction">
        <ol start={currentStep}>
          <li>{currentInstruction}</li>
        </ol>
      </div>
    </div>
  );
};

export default CourseTraining;
