import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import sys
import os
import torch
import json
import subprocess
from pathlib import Path

# Import custom modules
try:
    from feature_engineering import FeatureEngineer
    from model_utils import load_model
    from pipeline.types import PoseSequence
    from pose_processing import PoseProcessor
    from video_processing import VideoProcessor
    import config
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)


# Class quản lý trạng thái Phase (Đơn giản hóa)
class GolfPhaseDetector:
    def __init__(self):
        self.phase = "Address"
        self.state = 0
        # 0: Address
        # 1: Takeaway
        # 2: Backswing
        # 3: Top
        # 4: Downswing
        # 5: Impact
        # 6: Follow Through
        # 7: Finish
        self.prev_wrist_y = None
        self.min_wrist_y = 1.0  # Dùng để tìm Top (y nhỏ nhất)

    def update(self, landmarks):
        # landmarks: (33, 4) or list of NormalizedLandmark
        if isinstance(landmarks, list):
            # Convert list of NormalizedLandmark to numpy-like access if needed
            # But here we just need .y access
            wrist_y = (landmarks[15].y + landmarks[16].y) / 2
            shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
            hip_y = (landmarks[23].y + landmarks[24].y) / 2
        else:
            # Numpy array (33, 4) [x, y, z, vis]
            wrist_y = (landmarks[15, 1] + landmarks[16, 1]) / 2
            shoulder_y = (landmarks[11, 1] + landmarks[12, 1]) / 2
            hip_y = (landmarks[23, 1] + landmarks[24, 1]) / 2

        # Logic chuyển đổi trạng thái (Heuristic đơn giản)
        if self.state == 0:  # Address
            if wrist_y < hip_y:
                self.state = 1
                self.phase = "Takeaway"
        elif self.state == 1:  # Takeaway
            if wrist_y < shoulder_y:
                self.state = 2
                self.phase = "Backswing"
        elif self.state == 2:  # Backswing
            if wrist_y < self.min_wrist_y:
                self.min_wrist_y = wrist_y
            if wrist_y < (shoulder_y - 0.2):
                self.state = 3
                self.phase = "Top"
        elif self.state == 3:  # Top
            if wrist_y > (self.min_wrist_y + 0.05):
                self.state = 4
                self.phase = "Downswing"
        elif self.state == 4:  # Downswing
            if wrist_y > hip_y:
                self.state = 5
                self.phase = "Impact"
        elif self.state == 5:  # Impact
            if wrist_y < shoulder_y:
                self.state = 6
                self.phase = "Follow Through"
        elif self.state == 6:  # Follow Through
            if wrist_y < (shoulder_y - 0.1):
                self.state = 7
                self.phase = "Finish"

        return self.phase


def calculate_angle(a, b, c):
    """Tính góc giữa 3 điểm (theo độ)"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
        a[1] - b[1], a[0] - b[0]
    )
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle


def draw_landmarks_from_array(rgb_image, landmarks):
    """Draw landmarks from (33, 4) numpy array."""
    annotated_image = np.copy(rgb_image)
    height, width, _ = annotated_image.shape

    # Connections (BlazePose 33 keypoints)
    connections = [
        (0, 1),
        (1, 2),
        (2, 3),
        (3, 7),
        (0, 4),
        (4, 5),
        (5, 6),
        (6, 8),
        (9, 10),
        (11, 12),
        (11, 13),
        (13, 15),
        (15, 17),
        (15, 19),
        (15, 21),
        (17, 19),
        (12, 14),
        (14, 16),
        (16, 18),
        (16, 20),
        (16, 22),
        (18, 20),
        (11, 23),
        (12, 24),
        (23, 24),
        (23, 25),
        (24, 26),
        (25, 27),
        (26, 28),
        (27, 29),
        (28, 30),
        (29, 31),
        (30, 32),
        (27, 31),
        (28, 32),
    ]

    # 1. Convert coordinates
    pixel_landmarks = []
    for i in range(landmarks.shape[0]):
        lm = landmarks[i]
        px = int(lm[0] * width)
        py = int(lm[1] * height)
        pixel_landmarks.append((px, py))

    # 2. Color logic
    joint_colors = [(67, 70, 0)] * len(pixel_landmarks)

    if len(pixel_landmarks) > 15:
        left_arm_angle = calculate_angle(
            pixel_landmarks[11], pixel_landmarks[13], pixel_landmarks[15]
        )
        color_status = (0, 255, 0) if left_arm_angle > 160 else (0, 0, 255)
        joint_colors[11] = color_status
        joint_colors[13] = color_status
        joint_colors[15] = color_status

    if len(pixel_landmarks) > 0:
        joint_colors[0] = (255, 0, 255)

    # 3. Draw connections
    for start_idx, end_idx in connections:
        if start_idx < len(pixel_landmarks) and end_idx < len(pixel_landmarks):
            start_point = pixel_landmarks[start_idx]
            end_point = pixel_landmarks[end_idx]
            cv2.line(annotated_image, start_point, end_point, (96, 188, 249), 3)

    # 4. Draw joints
    for i, (px, py) in enumerate(pixel_landmarks):
        color = joint_colors[i]
        cv2.circle(annotated_image, (px, py), 6, color, -1)
        cv2.circle(annotated_image, (px, py), 2, (255, 255, 255), -1)

    return annotated_image


def process_video(input_path, output_path):
    print(f"Processing video: {input_path}")

    # Initialize Processors
    video_processor = VideoProcessor(target_fps=config.TARGET_FPS)
    pose_processor = PoseProcessor()
    feature_engineer = FeatureEngineer()

    # Load AI Model
    model_path = os.path.join("models", "coral_ordinal_model_20260102_001311.pth")
    try:
        ai_model = load_model(model_path)
        print("AI Model loaded successfully!")
    except Exception as e:
        print(f"Failed to load AI Model: {e}")
        ai_model = None

    # 1. Load and Resample Video
    try:
        print("Loading and resampling video...")
        video_clip = video_processor.load_and_resample(Path(input_path))
    except Exception as e:
        print(f"Error loading video: {e}")
        sys.exit(1)

    # 2. Extract Pose Sequence
    print("Extracting pose sequence...")
    pose_sequence = pose_processor.extract_sequence(video_clip.frames, video_clip.fps)

    # 3. Detect Swing Window (Optional but recommended for AI)
    print("Detecting swing window...")
    swing_window = video_processor.detect_swing_window(pose_sequence)
    print(
        f"Swing window detected: Frame {swing_window.start_frame} to {swing_window.end_frame}"
    )

    # 4. AI Prediction
    predicted_band = "Unknown"
    probs_str = ""
    swing_speed_val = 0.0
    arm_angle_val = 0.0

    if ai_model:
        try:
            print("Running AI Prediction...")
            # Slice sequence to swing window
            # Note: We need to handle if window is invalid or too short
            start = swing_window.start_frame
            end = swing_window.end_frame
            if end - start < 10:  # Too short, use full video
                start = 0
                end = len(pose_sequence.data)

            sliced_data = pose_sequence.data[start:end]
            sliced_mask = pose_sequence.interpolation_mask[start:end]
            sliced_valid = pose_sequence.valid_mask[start:end]
            sliced_times = pose_sequence.frame_times[start:end]

            sliced_seq = PoseSequence(
                data=sliced_data,
                frame_times=sliced_times,
                fps=pose_sequence.fps,
                interpolation_mask=sliced_mask,
                valid_mask=sliced_valid,
            )

            # Prepare for Model (Normalize & Resample)
            processed_seq, _ = pose_processor.prepare_sequence(sliced_seq)

            # Feature Engineering
            joint_feats, global_feats = feature_engineer.compute_features(processed_seq)

            # --- Calculate Metrics for Frontend (Before Normalization) ---
            # 1. Swing Speed (Max Wrist Speed)
            swing_speed_val = float(np.max(global_feats[:, 2]))

            # 2. Arm Angle (Max Left Elbow Angle)
            arm_angle_val = float(np.max(joint_feats[:, 13, 12]))

            print(f"DEBUG: Swing Speed={swing_speed_val}, Arm Angle={arm_angle_val}")

            # Check for Scaler and Normalize
            scaler_path = (
                config.OUTPUT_ROOT
                / config.FINAL_FEATURE_SUBDIR
                / config.SCALER_FILENAME
            )

            if scaler_path.exists():
                print(f"Loading scaler from {scaler_path}...")
                try:
                    with open(scaler_path, "r") as f:
                        scaler_data = json.load(f)

                    # Extract means and stds
                    j_mean = np.array(scaler_data["joint_mean"], dtype=np.float32)
                    j_std = np.array(scaler_data["joint_std"], dtype=np.float32)
                    g_mean = np.array(scaler_data["global_mean"], dtype=np.float32)
                    g_std = np.array(scaler_data["global_std"], dtype=np.float32)

                    # Handle zero std
                    j_std[j_std == 0] = 1.0
                    g_std[g_std == 0] = 1.0

                    # Apply Scaling
                    joint_feats = (joint_feats - j_mean) / j_std
                    global_feats = (global_feats - g_mean) / g_std

                    print("Applied Standard Scaling from feature_scaler.json.")
                except Exception as e:
                    print(f"ERROR loading/applying scaler: {e}")
            else:
                print(f"WARNING: Scaler file not found at {scaler_path}!")
                print(
                    "WARNING: Model is receiving unscaled data. Predictions will be unreliable."
                )

            # Flatten joint features: (T, 33, 13) -> (T, 429)
            T, J, D = joint_feats.shape
            joint_feats_flat = joint_feats.reshape(T, J * D)

            # Inference
            joint_tensor = torch.from_numpy(joint_feats_flat).unsqueeze(
                0
            )  # (1, T, 429)
            global_tensor = torch.from_numpy(global_feats).unsqueeze(0)  # (1, T, 3)

            with torch.no_grad():
                coral_logits, cls_logits = ai_model(joint_tensor, global_tensor)

                # --- Debugging Outputs ---
                print(f"Raw CLS Logits: {cls_logits.numpy()}")
                print(f"Raw CORAL Logits: {coral_logits.numpy()}")

                # 1. Classification Head Prediction
                probs = torch.softmax(cls_logits, dim=1)
                cls_pred_idx = torch.argmax(probs, dim=1).item()

                # 2. CORAL Head Prediction
                # coral_logits: (B, num_classes - 1)
                # Sigmoid gives P(y > k)
                coral_probs = torch.sigmoid(coral_logits)
                # Count how many thresholds are crossed (prob > 0.5)
                coral_pred_idx = torch.sum(coral_probs > 0.5, dim=1).item()

                print(
                    f"CLS Prediction: Class {cls_pred_idx} ({config.ID_TO_BAND.get(cls_pred_idx)})"
                )
                print(
                    f"CORAL Prediction: Class {coral_pred_idx} ({config.ID_TO_BAND.get(coral_pred_idx)})"
                )

                # DECISION dùng Classification head (softmax)
                pred_idx = cls_pred_idx
                predicted_band = config.ID_TO_BAND.get(pred_idx, "Unknown")

                # Use CLS probs for confidence display (optional, or derive from CORAL)
                probs_str = str(probs.numpy()[0])

                print(f"FINAL AI PREDICTION: Band {predicted_band} (Class {pred_idx})")

        except Exception as e:
            print(f"AI Prediction Error: {e}")
            import traceback

            traceback.print_exc()
    else:
        print("AI Model is None. Skipping prediction.")

    # 5. Generate Output Video
    print("Generating output video...")
    height, width, _ = video_clip.frames[0].shape

    temp_output_path = output_path + ".temp.mp4"
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(temp_output_path, fourcc, video_clip.fps, (width, height))

    phase_detector = GolfPhaseDetector()

    for i, frame in enumerate(video_clip.frames):
        # Get landmarks for this frame
        landmarks = pose_sequence.data[i]  # (33, 4)

        # Draw landmarks
        # Only draw if valid (visibility check is done inside draw but we can check valid_mask)
        if pose_sequence.valid_mask[i]:
            annotated_frame = draw_landmarks_from_array(frame, landmarks)
            current_phase = phase_detector.update(landmarks)
        else:
            annotated_frame = frame
            current_phase = phase_detector.phase  # Keep previous phase

        # Draw Phase
        cv2.putText(
            annotated_frame,
            f"Phase: {current_phase}",
            (50, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 0, 255),
            3,
            cv2.LINE_AA,
        )

        # Draw Prediction Result (if available)
        if predicted_band != "Unknown":
            cv2.putText(
                annotated_frame,
                f"Band: {predicted_band}",
                (50, 150),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (255, 0, 0),
                2,
                cv2.LINE_AA,
            )

        out.write(annotated_frame)

    out.release()
    pose_processor.reset()
    print("Video generation done.")

    # --- FFMPEG CONVERSION ---
    print("Converting to web-friendly format using FFmpeg...")
    try:
        # Lệnh ffmpeg: input temp -> codec libx264 -> pixel format yuv420p (quan trọng cho browser) -> output
        # -y: overwrite output file
        # -preset fast: convert nhanh
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                temp_output_path,
                "-vcodec",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-preset",
                "fast",
                output_path,
            ],
            check=True,
        )

        print("FFmpeg conversion successful!")

        # Xóa file tạm
        if os.path.exists(temp_output_path):
            os.remove(temp_output_path)

    except subprocess.CalledProcessError as e:
        print(f"FFmpeg failed: {e}")
        # Nếu ffmpeg lỗi, đổi tên file tạm thành file chính để dùng tạm
        if os.path.exists(temp_output_path):
            os.rename(temp_output_path, output_path)
    except FileNotFoundError:
        print("FFmpeg not found. Using original OpenCV output.")
        if os.path.exists(temp_output_path):
            os.rename(temp_output_path, output_path)

    print(f"Done! Final video saved to: {output_path}")


    result = {
        "band": predicted_band,
        "probs": probs_str,
        "swing_start": swing_window.start_frame,
        "swing_end": swing_window.end_frame,
        "swing_speed": swing_speed_val,
        "arm_angle": arm_angle_val,
    }
    print(f"__JSON_START__{json.dumps(result)}__JSON_END__")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_video.py <input_path> <output_path>")
        sys.exit(1)

    input_video = sys.argv[1]
    output_video = sys.argv[2]

    process_video(input_video, output_video)
