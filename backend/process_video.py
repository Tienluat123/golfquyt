import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import sys
import os


# Class quản lý trạng thái Phase (Đơn giản hóa)
class GolfPhaseDetector:
    def __init__(self):
        self.phase = "Address"
        self.state = 0  # 0: Address, 1: Backswing, 2: Top, 3: Downswing, 4: Impact, 5: Follow Through
        self.prev_wrist_y = None

    def update(self, landmarks):
        if not landmarks:
            return self.phase

        # Lấy tọa độ y của cổ tay (trung bình trái phải) và vai
        # 15: left wrist, 16: right wrist
        # 11: left shoulder, 12: right shoulder
        wrist_y = (landmarks[15].y + landmarks[16].y) / 2
        shoulder_y = (landmarks[11].y + landmarks[12].y) / 2

        # Logic chuyển đổi trạng thái đơn giản dựa trên độ cao tay
        # Lưu ý: y=0 là đỉnh ảnh, y=1 là đáy ảnh

        if self.state == 0:  # Address (Tay thấp)
            if wrist_y < shoulder_y:  # Tay bắt đầu đưa lên cao hơn vai
                self.state = 1
                self.phase = "Backswing"

        elif self.state == 1:  # Backswing (Đang đưa lên)
            if wrist_y < (shoulder_y - 0.2):  # Tay rất cao
                self.state = 2
                self.phase = "Top"

        elif self.state == 2:  # Top (Đỉnh)
            # Nếu tay bắt đầu đi xuống (y tăng) -> Downswing
            # Cần logic check velocity ở đây nhưng tạm thời check vị trí
            pass
            # Giả lập chuyển sang Downswing nếu tay thấp hơn một chút so với đỉnh (logic này hơi khó bắt nếu không có prev frame)
            # Tạm thời để đơn giản: Nếu tay thấp hơn Top một chút thì coi là Downswing
            if wrist_y > (shoulder_y - 0.15):
                self.state = 3
                self.phase = "Downswing"

        elif self.state == 3:  # Downswing (Đang đánh xuống)
            if wrist_y > shoulder_y:  # Tay xuống thấp hơn vai
                self.state = 4
                self.phase = "Impact"

        elif self.state == 4:  # Impact (Tiếp xúc bóng)
            if wrist_y < shoulder_y:  # Tay lại đưa lên cao (Follow through)
                self.state = 5
                self.phase = "Follow Through"

        return self.phase


def draw_landmarks_on_image(rgb_image, detection_result):
    pose_landmarks_list = detection_result.pose_landmarks
    annotated_image = np.copy(rgb_image)
    height, width, _ = annotated_image.shape

    # Thử lấy connections từ mp.solutions, nếu không được thì dùng list mặc định
    try:
        connections = mp.solutions.pose.POSE_CONNECTIONS
    except:
        # Fallback connections cho BlazePose (33 keypoints)
        connections = frozenset(
            [
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
        )

    # Loop through the detected poses to visualize.
    for pose_landmarks in pose_landmarks_list:
        # 1. Chuyển đổi tọa độ và vẽ các điểm khớp (Joints)
        pixel_landmarks = []
        for landmark in pose_landmarks:
            px = int(landmark.x * width)
            py = int(landmark.y * height)
            pixel_landmarks.append((px, py))

            # Vẽ điểm khớp: Màu Xanh Đậm (RGB: 0, 70, 67 -> BGR: 67, 70, 0)
            cv2.circle(annotated_image, (px, py), 5, (67, 70, 0), -1)
            cv2.circle(annotated_image, (px, py), 2, (255, 255, 255), -1)  # Tâm trắng

        # 2. Vẽ các đường nối (Connections)
        for connection in connections:
            start_idx = connection[0]
            end_idx = connection[1]

            if start_idx < len(pixel_landmarks) and end_idx < len(pixel_landmarks):
                start_point = pixel_landmarks[start_idx]
                end_point = pixel_landmarks[end_idx]

                # Vẽ đường nối: Màu Vàng Cam (RGB: 249, 188, 96 -> BGR: 96, 188, 249)
                cv2.line(annotated_image, start_point, end_point, (96, 188, 249), 3)

    return annotated_image


def process_video(input_path, output_path):
    print(f"Processing video: {input_path}")

    # Cấu hình MediaPipe Tasks
    base_options = python.BaseOptions(model_asset_path="pose_landmarker_full.task")
    options = vision.PoseLandmarkerOptions(
        base_options=base_options, output_segmentation_masks=False
    )
    detector = vision.PoseLandmarker.create_from_options(options)


import subprocess
import os

# ... existing code ...


def process_video(input_path, output_path):
    print(f"Processing video: {input_path}")

    # Cấu hình MediaPipe Tasks
    base_options = python.BaseOptions(model_asset_path="pose_landmarker_full.task")
    options = vision.PoseLandmarkerOptions(
        base_options=base_options, output_segmentation_masks=False
    )
    detector = vision.PoseLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error opening video file {input_path}")
        sys.exit(1)

    # Lấy thông số video gốc
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    if fps == 0:
        fps = 30

    # TẠO FILE TẠM THỜI ĐỂ GHI VIDEO RAW TỪ OPENCV
    # OpenCV đôi khi gặp khó khăn với codec H.264 trên một số hệ thống
    # Nên ta sẽ ghi ra file tạm (mp4v) rồi dùng FFmpeg convert lại cho chuẩn web
    temp_output_path = output_path + ".temp.mp4"

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(temp_output_path, fourcc, fps, (width, height))

    frame_count = 0
    phase_detector = GolfPhaseDetector()  # Khởi tạo bộ phát hiện Phase

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # Chuyển BGR sang RGB
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Tạo MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

        # AI phát hiện khớp xương
        detection_result = detector.detect(mp_image)

        # Vẽ lại lên ảnh
        annotated_image = draw_landmarks_on_image(image_rgb, detection_result)

        # Chuyển lại về BGR để xử lý tiếp (vẽ chữ)
        output_frame = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)

        # --- XỬ LÝ PHASE ---
        current_phase = "Address"  # Mặc định
        if detection_result.pose_landmarks:
            # Lấy landmarks của người đầu tiên (index 0)
            current_phase = phase_detector.update(detection_result.pose_landmarks[0])

        # Vẽ Phase lên video
        cv2.putText(
            output_frame,
            f"Phase: {current_phase}",
            (50, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 0, 255),
            3,
            cv2.LINE_AA,
        )

        out.write(output_frame)  # Ghi frame vào file tạm

    out.release()
    cap.release()
    print(f"OpenCV processing done. Frames: {frame_count}")

    # --- BƯỚC 2: DÙNG FFMPEG CONVERT SANG H.264 (CHUẨN WEB) ---
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


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_video.py <input_path> <output_path>")
        sys.exit(1)

    input_video = sys.argv[1]
    output_video = sys.argv[2]

    process_video(input_video, output_video)
