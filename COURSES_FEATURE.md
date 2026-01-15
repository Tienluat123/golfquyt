# Golf Course Training Feature

## Overview
This feature implements an interactive golf training course system with camera-based pose detection and real-time feedback.

## Features Implemented

### 1. Courses Page (`/courses`)
- Displays available golf training courses in a carousel
- Each course card shows:
  - Course thumbnail image
  - Category badge (e.g., "Tutorial", "Advanced")
  - Course title
  - Play button overlay
  - "Start Course" button
- Navigation arrows to browse through courses
- Responsive design matching Figma specifications

### 2. Course Checklist Page (`/courses/:courseId/checklist`)
- Shows detailed course information before starting
- Displays checklist items with:
  - Takeaway instructions
  - Shoulder turn guidance
  - Width control tips
- Large preview image of the course
- "Start" button to begin training
- "Back to Courses" navigation

### 3. Training Page (`/courses/:courseId/training/:stepId`)
- Full-screen camera view with live video feed
- Red dashed bounding box overlay for user positioning
- Step-by-step instructions at the bottom
- Back button to return to checklist
- Real-time pose detection (foundation implemented)
- Camera permission handling with error states

### 4. Course Complete Page (`/courses/:courseId/complete`)
- Congratulations screen after completing all steps
- Options to:
  - Return to courses list
  - Practice the course again
- Success icon and motivational message

## File Structure

```
frontend/src/
├── pages/
│   ├── Courses.jsx              # Main courses listing page
│   ├── Courses.css
│   ├── CourseChecklist.jsx      # Course details and checklist
│   ├── CourseChecklist.css
│   ├── CourseTraining.jsx       # Camera-based training view
│   ├── CourseTraining.css
│   ├── CourseComplete.jsx       # Completion screen
│   └── CourseComplete.css
├── hooks/
│   ├── useCamera.js             # Camera access and controls
│   └── usePoseDetection.js      # Pose detection integration
└── services/
    └── course.service.js        # API service for courses
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/courses` | Courses | Browse available courses |
| `/courses/:courseId/checklist` | CourseChecklist | View course details |
| `/courses/:courseId/training/:stepId` | CourseTraining | Train with camera |
| `/courses/:courseId/complete` | CourseComplete | Course completion |

## Usage

### Starting a Course
1. Navigate to `/courses`
2. Browse through available courses using arrow buttons
3. Click "Start Course" on desired course
4. Review checklist and instructions
5. Click "Start" to begin training

### Training Flow
1. Grant camera permissions when prompted
2. Position yourself within the red bounding box
3. Follow the step-by-step instructions
4. System will track your pose and movements
5. Progress through all training steps
6. Receive completion confirmation

## Camera Features

### useCamera Hook
Provides:
- Camera stream management
- Video reference handling
- Permission state tracking
- Frame capture capabilities
- Bounding box utilities

### usePoseDetection Hook
Provides:
- Pose landmark detection (foundation)
- Real-time pose tracking
- Visual feedback on canvas
- Pose validation callbacks

## Integration with Backend

The course system expects the following API endpoints:

```
GET    /courses                    # List all courses
GET    /courses/:id                # Get course details
GET    /courses/:id/checklist      # Get course checklist
POST   /courses/:id/start          # Start training session
POST   /courses/:id/steps/:stepId  # Submit step completion
POST   /courses/:id/complete       # Complete course
GET    /courses/:id/progress       # Get user progress
```

## Next Steps for Full Implementation

1. **Backend Integration**
   - Create course controller and routes
   - Add course models to database
   - Implement progress tracking

2. **Pose Detection**
   - Integrate MediaPipe Pose library
   - Add golf swing analysis algorithms
   - Implement real-time feedback

3. **Enhanced Features**
   - Add course progress indicators
   - Implement scoring system
   - Add video recording of user's swing
   - Compare user swing with reference

4. **UI Enhancements**
   - Add loading skeletons
   - Implement smooth transitions
   - Add sound effects and haptic feedback
   - Optimize for mobile devices

## Browser Requirements

- Modern browser with WebRTC support
- Camera access permissions
- Recommended: Chrome/Edge 90+, Firefox 88+, Safari 14+

## Dependencies

- React Router for navigation
- Custom hooks for camera and pose detection
- CSS for styling (no Tailwind required)

## Testing

To test the courses feature:
1. Start the frontend development server
2. Navigate to `/courses`
3. Test camera permissions in training mode
4. Verify all navigation flows work correctly

## Design Notes

All designs are based on Figma specifications:
- Node 49:51 - Courses listing
- Node 51:618 - Course checklist
- Node 51:804 - Training step 1
- Node 51:1026 - Training step 2

Color scheme:
- Primary green: #075b1f
- Error red: #e51919
- Background: rgba(255, 255, 255, 0.5)
- Text: Black and white variants
