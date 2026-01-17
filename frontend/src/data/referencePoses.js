// Reference poses for training steps
// Each pose has normalized landmark coordinates (0-1)

export const REFERENCE_POSES = {
    // Step 2: Knee Bend Pose
    2: {
        name: "Knee Bend",
        description: "Slight knee flex like sitting on a tall stool",
        // Key angles to match
        keyAngles: {
            leftKnee: 140,   // degrees
            rightKnee: 140,  // degrees
            leftHip: 170,    // degrees
            rightHip: 170    // degrees
        },
        // Tolerance for angle matching (±degrees)
        angleTolerance: 15,
        // Minimum similarity to pass (0-100%)
        passThreshold: 85,
        // Duration to hold pose (milliseconds)
        holdDuration: 2000,
        // Reference landmarks for visualization (normalized 0-1)
        referenceLandmarks: [
            // Head (0-10)
            { x: 0.5, y: 0.15, visibility: 0.95 },  // nose
            { x: 0.48, y: 0.14, visibility: 0.92 }, // left eye inner
            { x: 0.47, y: 0.14, visibility: 0.91 }, // left eye
            { x: 0.46, y: 0.14, visibility: 0.90 }, // left eye outer
            { x: 0.52, y: 0.14, visibility: 0.92 }, // right eye inner
            { x: 0.53, y: 0.14, visibility: 0.91 }, // right eye
            { x: 0.54, y: 0.14, visibility: 0.90 }, // right eye outer
            { x: 0.46, y: 0.16, visibility: 0.88 }, // left ear
            { x: 0.54, y: 0.16, visibility: 0.88 }, // right ear
            { x: 0.48, y: 0.18, visibility: 0.85 }, // mouth left
            { x: 0.52, y: 0.18, visibility: 0.85 }, // mouth right

            // Upper body (11-16) - tilted forward, arms extended
            { x: 0.42, y: 0.38, visibility: 0.95 },  // left shoulder (wider)
            { x: 0.58, y: 0.38, visibility: 0.95 },  // right shoulder (wider)
            { x: 0.35, y: 0.50, visibility: 0.90 },  // left elbow (extended out)
            { x: 0.65, y: 0.50, visibility: 0.90 },  // right elbow (extended out)
            { x: 0.30, y: 0.62, visibility: 0.85 },  // left wrist (extended down)
            { x: 0.70, y: 0.62, visibility: 0.85 },  // right wrist (extended down)

            // Hands (17-22)
            { x: 0.28, y: 0.65, visibility: 0.75 }, // left pinky
            { x: 0.28, y: 0.64, visibility: 0.75 }, // left index
            { x: 0.28, y: 0.66, visibility: 0.75 }, // left thumb
            { x: 0.72, y: 0.65, visibility: 0.75 }, // right pinky
            { x: 0.72, y: 0.64, visibility: 0.75 }, // right index
            { x: 0.72, y: 0.66, visibility: 0.75 }, // right thumb

            // Lower body (23-28) - ATHLETIC STANCE, KNEES BENT ~140°
            { x: 0.45, y: 0.62, visibility: 0.95 },  // left hip (tilted forward)
            { x: 0.55, y: 0.62, visibility: 0.95 },  // right hip (tilted forward)
            { x: 0.44, y: 0.78, visibility: 0.90 },  // left knee (bent ~140°)
            { x: 0.56, y: 0.78, visibility: 0.90 },  // right knee (bent ~140°)
            { x: 0.43, y: 0.92, visibility: 0.85 },  // left ankle
            { x: 0.57, y: 0.92, visibility: 0.85 },  // right ankle

            // Feet (29-32)
            { x: 0.44, y: 0.98, visibility: 0.80 },  // left heel
            { x: 0.56, y: 0.98, visibility: 0.80 },  // right heel
            { x: 0.43, y: 0.99, visibility: 0.75 },  // left foot index
            { x: 0.57, y: 0.99, visibility: 0.75 }   // right foot index
        ]
    },

    // Step 3: Hip Tilt
    3: {
        name: "Hip Tilt",
        description: "Lean forward from hips while keeping back straight",
        keyAngles: {
            leftKnee: 140,
            rightKnee: 140,
            leftHip: 150,
            rightHip: 150,
            spine: 160  // Forward tilt from vertical
        },
        angleTolerance: 15,
        passThreshold: 85,
        holdDuration: 2000
    },

    // Step 4: Arm Hang
    4: {
        name: "Arm Hang",
        description: "Arms hanging naturally without tension",
        keyAngles: {
            leftKnee: 140,
            rightKnee: 140,
            leftShoulder: 170,
            rightShoulder: 170,
            leftElbow: 175,
            rightElbow: 175
        },
        angleTolerance: 15,
        passThreshold: 85,
        holdDuration: 2000
    },

    // Step 5: Balance Check
    5: {
        name: "Balance Check",
        description: "Centered and balanced position",
        keyAngles: {
            leftKnee: 140,
            rightKnee: 140,
            leftHip: 170,
            rightHip: 170
        },
        angleTolerance: 15,
        passThreshold: 85,
        holdDuration: 2000,
        // Additional check: weight distribution
        checkBalance: true
    }
};

export default REFERENCE_POSES;
