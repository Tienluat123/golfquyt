import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetection } from '../hooks/usePoseDetection';
import COURSE_LESSONS from '../data/courseLessons';
import REFERENCE_POSES from '../data/referencePoses';
import './CourseTraining.css';

const CourseTraining = () => {
  const navigate = useNavigate();
  const { courseId, stepId } = useParams();
  const { videoRef, canvasRef, isLoading, error } = useCamera();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUserInBox, setIsUserInBox] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [poseSimilarity, setPoseSimilarity] = useState(0);
  const [isPoseMatched, setIsPoseMatched] = useState(false);
  const poseMatchTimeRef = useRef(null);

  // Enable pose detection for step 1 bounding box check
  console.log('🔧 usePoseDetection config:', {
    hasAcknowledged,
    currentStep,
    enabledValue: hasAcknowledged,
    referencePoseProvided: currentStep >= 2 ? 'yes' : 'no'
  });

  const { currentPose, isPoseDetecting, drawReferencePose } = usePoseDetection({
    videoRef,
    canvasRef,
    enabled: hasAcknowledged, // Enable for all steps after acknowledgment
    referencePose: null, // Disable reference pose drawing (remove blue skeleton)
    onPoseDetected: (pose) => {
      console.log('🎯 Pose Detection Event:', {
        step: currentStep,
        acknowledged: hasAcknowledged,
        poseReceived: !!pose,
        hasLandmarks: pose?.landmarks?.length || 0
      });

      if (currentStep === 1 && pose) {
        // Step 1: Check if user is in bounding box
        const inBox = checkUserInBoundingBox(pose);
        console.log(`📦 Bounding Box Check: ${inBox ? '✅ IN BOX' : '❌ NOT IN BOX'}`);
        setIsUserInBox(inBox);
      } else if (currentStep >= 2 && pose) {
        if (currentStep === 2) {
          const kneeAngle = getAverageKneeAngle(pose);
          setPoseSimilarity(kneeAngle);

          if (kneeAngle >= 125 && kneeAngle <= 155) {
            setIsPoseMatched(true);
          } else {
            setIsPoseMatched(false);
            poseMatchTimeRef.current = null;
          }
        } else if (currentStep === 3) {
          const hipAngle = getAverageHipAngle(pose);
          setPoseSimilarity(hipAngle);

          if (hipAngle >= 135 && hipAngle <= 165) {
            setIsPoseMatched(true);
          } else {
            setIsPoseMatched(false);
            poseMatchTimeRef.current = null;
          }
        }
      }
    }
  });

  console.log('📊 Detection Status:', {
    isPoseDetecting,
    hasPose: !!currentPose,
    isUserInBox
  });

  // Get training lesson data based on courseId
  const lessonSlides = COURSE_LESSONS[parseInt(courseId)] || [];

  // Fallback to empty array if no lesson found
  const trainingSteps = lessonSlides.length > 0 ? lessonSlides : [
    {
      stepIndex: 1,
      title: 'No Lesson Available',
      instruction: 'This course does not have a lesson yet.',
      visualGuide: 'Please return to course selection',
      userAction: 'Click back to return'
    }
  ];

  useEffect(() => {
    const step = parseInt(stepId) || 1;
    setCurrentStep(step);
    setHasAcknowledged(false); // Reset acknowledgment when step changes
  }, [stepId]);

  // Auto-advance from step 1 when user is detected in bounding box
  useEffect(() => {
    if (currentStep === 1 && hasAcknowledged && isUserInBox) {
      // Wait a bit to confirm detection, then auto-advance
      const timer = setTimeout(() => {
        if (isUserInBox) {
          handleNextStep();
        }
      }, 1000); // 1 second confirmation delay

      return () => clearTimeout(timer);
    }
  }, [currentStep, hasAcknowledged, isUserInBox]);

  // Auto-advance from step 2+ when pose matches for required duration
  useEffect(() => {
    if (currentStep >= 2 && hasAcknowledged && isPoseMatched) {
      const referencePose = REFERENCE_POSES[currentStep];

      if (!poseMatchTimeRef.current) {
        // Start timer
        poseMatchTimeRef.current = Date.now();
        console.log(`⏱️ Pose matched! Holding for ${referencePose.holdDuration}ms...`);
      } else {
        // Check if held long enough
        const holdTime = Date.now() - poseMatchTimeRef.current;

        if (holdTime >= referencePose.holdDuration) {
          console.log(`✅ Pose held for ${holdTime}ms - advancing to next step!`);
          poseMatchTimeRef.current = null;
          handleNextStep();
        }
      }
    } else {
      // Reset timer if pose doesn't match
      if (poseMatchTimeRef.current && !isPoseMatched) {
        console.log('❌ Pose match lost - resetting timer');
        poseMatchTimeRef.current = null;
      }
    }
  }, [currentStep, hasAcknowledged, isPoseMatched, poseSimilarity]);

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

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        console.log('📹 Camera stopped on unmount');
      }
    };
  }, [videoRef]);

  const handleBack = () => {
    // Explicitly stop camera tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    navigate(`/courses/${courseId}/checklist`);
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;

    // Save progress
    localStorage.setItem(`course_${courseId}_progress`, JSON.stringify({
      lastStep: currentStep,
      completed: nextStep > trainingSteps.length,
      timestamp: Date.now()
    }));

    if (nextStep <= trainingSteps.length) {
      navigate(`/courses/${courseId}/training/${nextStep}`);
    } else {
      // Course completed
      navigate(`/courses/${courseId}/complete`);
    }
  };

  const handleAcknowledge = () => {
    console.log('✅ User acknowledged instructions - enabling pose detection');
    setHasAcknowledged(true);
  };

  // Calculate angle between 3 points (in degrees)
  const calculateAngle = (point1, point2, point3) => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
      Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let degrees = Math.abs(radians * 180 / Math.PI);
    if (degrees > 180) degrees = 360 - degrees;
    return degrees;
  };

  // Get average knee angle from pose (for step 2+ knee detection)
  const getAverageKneeAngle = (pose) => {
    if (!pose || !pose.landmarks) return 0;

    const landmarks = pose.landmarks;

    // MediaPipe landmark indices
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;
    const LEFT_KNEE = 25;
    const RIGHT_KNEE = 26;
    const LEFT_ANKLE = 27;
    const RIGHT_ANKLE = 28;

    let angles = [];

    // Calculate left knee angle (hip-knee-ankle)
    if (landmarks[LEFT_HIP] && landmarks[LEFT_KNEE] && landmarks[LEFT_ANKLE]) {
      const leftAngle = calculateAngle(
        landmarks[LEFT_HIP],
        landmarks[LEFT_KNEE],
        landmarks[LEFT_ANKLE]
      );
      angles.push(leftAngle);
      console.log(`  Left knee: ${leftAngle.toFixed(1)}°`);
    }

    // Calculate right knee angle
    if (landmarks[RIGHT_HIP] && landmarks[RIGHT_KNEE] && landmarks[RIGHT_ANKLE]) {
      const rightAngle = calculateAngle(
        landmarks[RIGHT_HIP],
        landmarks[RIGHT_KNEE],
        landmarks[RIGHT_ANKLE]
      );
      angles.push(rightAngle);
      console.log(`  Right knee: ${rightAngle.toFixed(1)}°`);
    }

    // Return average
    if (angles.length === 0) return 0;
    const average = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
    return average;
  };

  // Get average hip angle from pose (for step 3 hip tilt)
  const getAverageHipAngle = (pose) => {
    if (!pose || !pose.landmarks) return 0;

    const landmarks = pose.landmarks;

    // MediaPipe landmark indices
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;
    const LEFT_KNEE = 25;
    const RIGHT_KNEE = 26;

    let angles = [];

    // Calculate left hip angle (shoulder-hip-knee)
    if (landmarks[LEFT_SHOULDER] && landmarks[LEFT_HIP] && landmarks[LEFT_KNEE]) {
      const leftAngle = calculateAngle(
        landmarks[LEFT_SHOULDER],
        landmarks[LEFT_HIP],
        landmarks[LEFT_KNEE]
      );
      angles.push(leftAngle);
      console.log(`  Left hip: ${leftAngle.toFixed(1)}°`);
    }

    // Calculate right hip angle
    if (landmarks[RIGHT_SHOULDER] && landmarks[RIGHT_HIP] && landmarks[RIGHT_KNEE]) {
      const rightAngle = calculateAngle(
        landmarks[RIGHT_SHOULDER],
        landmarks[RIGHT_HIP],
        landmarks[RIGHT_KNEE]
      );
      angles.push(rightAngle);
      console.log(`  Right hip: ${rightAngle.toFixed(1)}°`);
    }

    // Return average
    if (angles.length === 0) return 0;
    const average = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
    return average;
  };

  // Compare current pose with reference pose for current step
  const comparePoses = (userPose, stepNumber) => {
    const referencePose = REFERENCE_POSES[stepNumber];
    if (!referencePose || !userPose || !userPose.landmarks) {
      return 0;
    }

    const landmarks = userPose.landmarks;

    // MediaPipe Pose landmark indices
    const LANDMARKS = {
      LEFT_SHOULDER: 11,
      RIGHT_SHOULDER: 12,
      LEFT_HIP: 23,
      RIGHT_HIP: 24,
      LEFT_KNEE: 25,
      RIGHT_KNEE: 26,
      LEFT_ANKLE: 27,
      RIGHT_ANKLE: 28,
      LEFT_ELBOW: 13,
      RIGHT_ELBOW: 15
    };

    // Calculate current angles
    const currentAngles = {};

    // Left knee angle (hip-knee-ankle)
    if (landmarks[LANDMARKS.LEFT_HIP] && landmarks[LANDMARKS.LEFT_KNEE] && landmarks[LANDMARKS.LEFT_ANKLE]) {
      currentAngles.leftKnee = calculateAngle(
        landmarks[LANDMARKS.LEFT_HIP],
        landmarks[LANDMARKS.LEFT_KNEE],
        landmarks[LANDMARKS.LEFT_ANKLE]
      );
    }

    // Right knee angle
    if (landmarks[LANDMARKS.RIGHT_HIP] && landmarks[LANDMARKS.RIGHT_KNEE] && landmarks[LANDMARKS.RIGHT_ANKLE]) {
      currentAngles.rightKnee = calculateAngle(
        landmarks[LANDMARKS.RIGHT_HIP],
        landmarks[LANDMARKS.RIGHT_KNEE],
        landmarks[LANDMARKS.RIGHT_ANKLE]
      );
    }

    // Left hip angle (shoulder-hip-knee)
    if (landmarks[LANDMARKS.LEFT_SHOULDER] && landmarks[LANDMARKS.LEFT_HIP] && landmarks[LANDMARKS.LEFT_KNEE]) {
      currentAngles.leftHip = calculateAngle(
        landmarks[LANDMARKS.LEFT_SHOULDER],
        landmarks[LANDMARKS.LEFT_HIP],
        landmarks[LANDMARKS.LEFT_KNEE]
      );
    }

    // Right hip angle
    if (landmarks[LANDMARKS.RIGHT_SHOULDER] && landmarks[LANDMARKS.RIGHT_HIP] && landmarks[LANDMARKS.RIGHT_KNEE]) {
      currentAngles.rightHip = calculateAngle(
        landmarks[LANDMARKS.RIGHT_SHOULDER],
        landmarks[LANDMARKS.RIGHT_HIP],
        landmarks[LANDMARKS.RIGHT_KNEE]
      );
    }

    console.log('📐 Current Angles:', currentAngles);
    console.log('📋 Reference Angles:', referencePose.keyAngles);

    // Calculate similarity based on angle differences
    const angleKeys = Object.keys(referencePose.keyAngles);
    let totalDifference = 0;
    let angleCount = 0;

    angleKeys.forEach(key => {
      if (currentAngles[key] !== undefined) {
        const difference = Math.abs(currentAngles[key] - referencePose.keyAngles[key]);
        const score = Math.max(0, 100 - (difference / referencePose.angleTolerance) * 100);
        totalDifference += score;
        angleCount++;

        console.log(`  ${key}: current=${currentAngles[key].toFixed(1)}°, ref=${referencePose.keyAngles[key]}°, diff=${difference.toFixed(1)}°, score=${score.toFixed(1)}%`);
      }
    });

    const similarity = angleCount > 0 ? totalDifference / angleCount : 0;
    return similarity;
  };

  // Check if user's pose is within the bounding box
  const checkUserInBoundingBox = (pose) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Starting Bounding Box Detection...');

    // Check 1: Pose exists
    if (!pose) {
      console.log('❌ No pose object received');
      return false;
    }
    console.log('✅ Pose object exists');

    // Check 2: Landmarks exist
    if (!pose.landmarks) {
      console.log('❌ No landmarks in pose object');
      return false;
    }
    console.log(`✅ Landmarks array exists with ${pose.landmarks.length} points`);

    // Check 3: Landmarks not empty
    if (pose.landmarks.length === 0) {
      console.log('❌ Landmarks array is empty');
      return false;
    }

    // Get video dimensions
    const videoWidth = videoRef.current?.videoWidth || 1920;
    const videoHeight = videoRef.current?.videoHeight || 1080;
    console.log(`📺 Video dimensions: ${videoWidth}x${videoHeight}`);

    // Bounding box parameters (matching CSS)
    const boxWidth = 248;
    const boxHeight = 800;
    const boxCenterX = videoWidth / 2 + 28;
    const boxCenterY = videoHeight / 2 + 22.5;
    const boxLeft = boxCenterX - boxWidth / 2;
    const boxRight = boxCenterX + boxWidth / 2;
    const boxTop = boxCenterY - boxHeight / 2;
    const boxBottom = boxCenterY + boxHeight / 2;

    console.log(`📦 Bounding Box:`, {
      width: boxWidth,
      height: boxHeight,
      left: boxLeft.toFixed(1),
      right: boxRight.toFixed(1),
      top: boxTop.toFixed(1),
      bottom: boxBottom.toFixed(1)
    });

    // Check if key points are within box
    let pointsInBox = 0;
    let totalPoints = 0;
    let visiblePoints = 0;

    // Foot/ankle landmark indices (MediaPipe Pose)
    const footLandmarkIndices = [27, 28, 29, 30, 31, 32]; // ankles, heels, foot indices
    let footPointsInBox = 0;
    let visibleFootPoints = 0;

    pose.landmarks.forEach((keypoint, index) => {
      if (keypoint && keypoint.visibility && keypoint.visibility > 0.3) {
        visiblePoints++;
        totalPoints++;
        const x = keypoint.x * videoWidth;
        const y = keypoint.y * videoHeight;

        const isInBox = x >= boxLeft && x <= boxRight && y >= boxTop && y <= boxBottom;

        if (isInBox) {
          pointsInBox++;
        }

        // Track foot/ankle landmarks specifically
        if (footLandmarkIndices.includes(index)) {
          visibleFootPoints++;
          if (isInBox) {
            footPointsInBox++;
          }

          // Log foot points specifically
          console.log(`  👣 Foot Point ${index}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, vis=${keypoint.visibility.toFixed(2)}, ${isInBox ? '✅ IN' : '❌ OUT'}`);
        }

        // Log first few keypoints for debugging
        if (index < 5) {
          console.log(`  Point ${index}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, vis=${keypoint.visibility.toFixed(2)}, ${isInBox ? '✅ IN' : '❌ OUT'}`);
        }
      }
    });

    const percentage = totalPoints > 0 ? (pointsInBox / totalPoints) * 100 : 0;
    const threshold = 90; // 90%
    const meetsThreshold = percentage >= threshold;

    // Check if feet are visible and in box
    const hasVisibleFeet = visibleFootPoints >= 2; // At least 2 foot points visible
    const hasFeetInBox = footPointsInBox >= 2; // At least 2 foot points in box

    console.log('📊 Detection Summary:');
    console.log(`  Total landmarks: ${pose.landmarks.length}`);
    console.log(`  Visible points (>0.3): ${visiblePoints}`);
    console.log(`  Points checked: ${totalPoints}`);
    console.log(`  Points in box: ${pointsInBox}`);
    console.log(`  Percentage in box: ${percentage.toFixed(1)}%`);
    console.log(`  Threshold: ${threshold}%`);
    console.log(`  👣 Foot Check:`);
    console.log(`    - Visible foot points: ${visibleFootPoints}/6`);
    console.log(`    - Foot points in box: ${footPointsInBox}/6`);
    console.log(`    - Has visible feet: ${hasVisibleFeet ? '✅' : '❌'}`);
    console.log(`    - Feet in box: ${hasFeetInBox ? '✅' : '❌'}`);

    const finalResult = meetsThreshold && hasVisibleFeet && hasFeetInBox;

    console.log(`  Result: ${finalResult ? '✅ PASS - Full body including feet detected in box!' : `❌ FAIL - ${!meetsThreshold ? 'Body coverage insufficient' : !hasVisibleFeet ? 'Feet not visible' : 'Feet not in box'}`}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // User is "in box" if at least 90% of detected points are inside AND feet are visible and in box
    return finalResult;
  };

  const currentSlide = trainingSteps[currentStep - 1] || {};
  const currentInstruction = currentSlide.instruction || '';
  const currentTitle = currentSlide.title || '';
  const currentVisualGuide = currentSlide.visualGuide || '';
  const currentUserAction = currentSlide.userAction || '';

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

        {/* Bounding box overlay - only show in step 1 */}
        {currentStep === 1 && (
          <div className={`bounding-box ${isUserInBox ? 'detected' : ''}`}></div>
        )}

        {/* Back button */}
        <button className="training-back-button" onClick={handleBack}>
          <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
            <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 6H27" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Instruction overlay - show before acknowledgment */}
      {!hasAcknowledged && (
        <div className="instruction-overlay">
          <div className="instruction-modal">
            <div className="instruction-header">
              <span className="step-number">Step {currentStep}/{trainingSteps.length}</span>
              <h2 className="instruction-title">{currentTitle}</h2>
            </div>
            <p className="instruction-text">{currentInstruction}</p>
            <div className="visual-guide">
              <strong>Visual Guide:</strong> {currentVisualGuide}
            </div>
            <div className="user-action">
              <strong>Your Action:</strong> {currentUserAction}
            </div>
            <button className="ok-btn" onClick={handleAcknowledge}>
              OK, Let's Start
            </button>
          </div>
        </div>
      )}

      {/* Instruction box at bottom - show after acknowledgment */}
      {hasAcknowledged && (
        <div className="training-instruction">
          <div className="instruction-header">
            <span className="step-number">Step {currentStep}/{trainingSteps.length}</span>
            <h2 className="instruction-title">{currentTitle}</h2>
          </div>
          {currentStep === 1 && (
            <p className="detection-status">
              {isUserInBox ? '✓ Position detected! Moving to next step...' : 'Position yourself inside the box'}
            </p>
          )}
          {currentStep >= 2 && (
            <>
              <div className="pose-matching-status">
                <div className="similarity-score">
                  <span className="score-label">
                    {currentStep === 3 ? 'Hip Angle:' : 'Knee Angle:'}
                  </span>
                  <span className={`score-value ${isPoseMatched ? 'matched' : ''}`}>
                    {poseSimilarity.toFixed(1)}°
                  </span>
                </div>
                {isPoseMatched ? (
                  <p className="detection-status matched">
                    ✓ Pose matched! Hold this position...
                  </p>
                ) : (
                  <p className="instruction-text">{currentInstruction}</p>
                )}
              </div>
              <button className="next-step-btn" onClick={handleNextStep}>
                {currentStep < trainingSteps.length ? 'Skip to Next Step' : 'Complete Course'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseTraining;
