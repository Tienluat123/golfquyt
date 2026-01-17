import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { getCourseById } from '../services/course.service';
import './CourseTraining.css';

// Calculate angle between 3 points (in degrees)
const calculateAngle = (point1, point2, point3) => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
        Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let degrees = Math.abs(radians * 180 / Math.PI);
    if (degrees > 180) degrees = 360 - degrees;
    return degrees;
};

const getAngleFromKeyPoints = (pose, keyPointNames) => {
    if (!pose || !pose.landmarks || keyPointNames.length !== 3) return 0;

    const LANDMARK_INDICES = {
        nose: 0,
        leftEyeInner: 1, leftEye: 2, leftEyeOuter: 3,
        rightEyeInner: 4, rightEye: 5, rightEyeOuter: 6,
        leftEar: 7, rightEar: 8,
        mouthLeft: 9, mouthRight: 10,
        leftShoulder: 11, rightShoulder: 12,
        leftElbow: 13, rightElbow: 14,
        leftWrist: 15, rightWrist: 16,
        leftPinky: 17, rightPinky: 18,
        leftIndex: 19, rightIndex: 20,
        leftThumb: 21, rightThumb: 22,
        leftHip: 23, rightHip: 24,
        leftKnee: 25, rightKnee: 26,
        leftAnkle: 27, rightAnkle: 28,
        leftHeel: 29, rightHeel: 30,
        leftFootIndex: 31, rightFootIndex: 32
    };

    const p1Index = LANDMARK_INDICES[keyPointNames[0]];
    const p2Index = LANDMARK_INDICES[keyPointNames[1]];
    const p3Index = LANDMARK_INDICES[keyPointNames[2]];

    const p1 = pose.landmarks[p1Index];
    const p2 = pose.landmarks[p2Index];
    const p3 = pose.landmarks[p3Index];

    if (p1 && p2 && p3 && p1.visibility > 0.5 && p2.visibility > 0.5 && p3.visibility > 0.5) {
        return calculateAngle(p1, p2, p3);
    }
    return null;
};

const CourseTraining = () => {
    const navigate = useNavigate();
    const { courseId, stepId } = useParams();
    const { videoRef, canvasRef, isLoading: isCameraLoading, error } = useCamera();
    const [currentStep, setCurrentStep] = useState(1);

    // Sync currentStep with URL params
    useEffect(() => {
        if (stepId) {
            const step = parseInt(stepId, 10);
            if (!isNaN(step) && step !== currentStep) {
                console.log(`🔄 Syncing step from URL: ${step}`);
                setCurrentStep(step);
            }
        }
    }, [stepId]);

    const [isUserInBox, setIsUserInBox] = useState(false);
    const [hasAcknowledged, setHasAcknowledged] = useState(false);
    const [poseSimilarity, setPoseSimilarity] = useState(null);
    const [isPoseMatched, setIsPoseMatched] = useState(false);
    const poseMatchTimeRef = useRef(null);

    const [course, setCourse] = useState(null);
    const [isCourseLoading, setIsCourseLoading] = useState(true);

    // Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setIsCourseLoading(true);
                const data = await getCourseById(courseId);
                setCourse(data);
            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setIsCourseLoading(false);
            }
        };
        if (courseId) fetchCourse();
    }, [courseId]);

    // Get training lesson data based on course
    const trainingSteps = course?.trainingSteps || [];

    // Enable pose detection for step 1 bounding box check
    console.log(' usePoseDetection config:', {
        hasAcknowledged,
        currentStep,
        enabledValue: hasAcknowledged,
        referencePoseProvided: currentStep >= 2 ? 'yes' : 'no'
    });

    // Generic Pose Validation Logic
    const validatePose = (pose, criteria) => {
        if (!criteria) return false;

        if (criteria.type === 'position') {
            // For position type (e.g. Step 1), we check bounding box
            // In a real generic system, we might check specific landmarks relative to frame
            return checkUserInBoundingBox(pose);
        }

        if (criteria.type === 'angle') {
            if (!criteria.keyPoints || criteria.keyPoints.length !== 3) return false;

            // Map string keypoints to landmark indices if needed, or use a helper
            // Here assuming getAngleFromKeyPoints can handle the mapping
            const angle = getAngleFromKeyPoints(pose, criteria.keyPoints);
            setPoseSimilarity(angle);

            return angle >= criteria.min && angle <= criteria.max;
        }

        return false;
    };

    const { currentPose, isPoseDetecting, drawReferencePose } = usePoseDetection({
        videoRef,
        canvasRef,
        enabled: hasAcknowledged,
        referencePose: null,
        onPoseDetected: (pose) => {
            if (!pose || !hasAcknowledged) return;

            const currentSlide = trainingSteps[currentStep - 1];
            const criteria = currentSlide?.criteria;

            if (criteria) {
                const isMatched = validatePose(pose, criteria);

                // For UI feedback on 'position' type
                if (criteria.type === 'position') {
                    setIsUserInBox(isMatched);
                }

                setIsPoseMatched(isMatched);
            }
        }
    });

    const handleNextStep = () => {
        const nextStep = currentStep + 1;
        console.log(`⏩ Advancing Step: Current=${currentStep}, Next=${nextStep}, Total=${trainingSteps.length}`);

        // Reset states for next step
        setPoseSimilarity(null);
        setIsPoseMatched(false);
        setIsUserInBox(false);
        setHasAcknowledged(false);

        // Save progress
        localStorage.setItem(`course_${courseId}_progress`, JSON.stringify({
            lastStep: currentStep,
            completed: nextStep > trainingSteps.length,
            timestamp: Date.now()
        }));

        if (nextStep <= trainingSteps.length) {
            navigate(`/courses/${courseId}/training/${nextStep}`);
            setCurrentStep(nextStep);
        } else {
            // Course completed
            navigate(`/courses/${courseId}/complete`);
        }
    };

    // Auto-advance when pose matches for required duration
    useEffect(() => {
        let intervalId;

        if (hasAcknowledged && isPoseMatched) {
            const currentSlide = trainingSteps[currentStep - 1];
            const holdDuration = currentSlide?.criteria?.holdDuration || 2000;

            if (!poseMatchTimeRef.current) {
                poseMatchTimeRef.current = Date.now();
                console.log(`⏱️ Pose matched! Holding for ${holdDuration}ms...`);
            }

            intervalId = setInterval(() => {
                const holdTime = Date.now() - poseMatchTimeRef.current;
                if (holdTime >= holdDuration) {
                    console.log(`✅ Pose held for ${holdTime}ms - advancing!`);
                    poseMatchTimeRef.current = null;
                    clearInterval(intervalId);
                    handleNextStep();
                }
            }, 100);
        } else {
            poseMatchTimeRef.current = null;
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPoseMatched, currentStep, hasAcknowledged, trainingSteps]);

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



    const handleAcknowledge = () => {
        console.log('✅ User acknowledged instructions - enabling pose detection');
        setHasAcknowledged(true);
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

            {isCameraLoading && (
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

                    <div className="pose-matching-status">
                        {/* Dynamic Feedback UI based on criteria type */}
                        {currentSlide.criteria?.type === 'angle' && (
                            <div className="similarity-score">
                                <span className="score-label">
                                    Current Angle:
                                </span>
                                {poseSimilarity !== null ? (
                                    <span className={`score-value ${isPoseMatched ? 'matched' : ''}`}>
                                        {poseSimilarity.toFixed(1)}°
                                    </span>
                                ) : (
                                    <span className="score-value warning" style={{ fontSize: '1rem', color: '#ff4444', whiteSpace: 'nowrap' }}>
                                        Show Body ⚠️
                                    </span>
                                )}
                                <span className="score-target">
                                    (Target: {currentSlide.criteria.min}° - {currentSlide.criteria.max}°)
                                </span>
                            </div>
                        )}

                        {currentSlide.criteria?.type === 'position' && (
                            <p className="detection-status">
                                {isPoseMatched ? '✓ Position detected! Hold still...' : 'Position yourself as shown in the guide'}
                            </p>
                        )}

                        {isPoseMatched ? (
                            <p className="detection-status matched">
                                ✓ Excellent! Hold this position...
                            </p>
                        ) : (
                            <p className="instruction-text">{currentInstruction}</p>
                        )}
                    </div>

                    {/* Manual skip button always available just in case */}
                    <button className="next-step-btn" onClick={handleNextStep}>
                        {currentStep < trainingSteps.length ? 'Skip to Next Step' : 'Complete Course'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseTraining;
