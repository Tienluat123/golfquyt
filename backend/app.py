from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import time

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)


@app.route("/analyze", methods=["POST"])
def analyze_video():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Giả lập xử lý video (AI detect khớp & phase)
        # Trong thực tế, bạn sẽ gọi model AI ở đây
        time.sleep(2)  # Giả lập thời gian xử lý

        # Trả về video gốc (hoặc video đã xử lý nếu có)
        # Ở đây mình trả về chính video vừa upload để demo
        return send_file(filepath, mimetype="video/mp4")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
