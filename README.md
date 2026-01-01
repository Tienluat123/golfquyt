# Golf Quyt Analyzer

AI-powered golf swing analysis application. This tool uses computer vision to analyze golf swings from video uploads, providing metrics like swing speed, arm angle, and handicap band prediction.

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- FFmpeg (Required for video processing)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tienluat123/golfquyt.git
cd golfquyt
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install Node.js dependencies:

```bash
npm install
```

Install Python dependencies:

It is recommended to use a virtual environment.

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

**Important:** Ensure FFmpeg is installed and accessible in your system PATH.

- macOS: `brew install ffmpeg`
- Windows: Download and add to PATH.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

## Running the Application

You need to run both the backend and frontend servers.

### Start Backend

Open a terminal in the `backend` directory:

```bash
# Ensure your python virtual environment is activated if you used one
npm start
```

The backend server will start on `http://localhost:5001`.

### Start Frontend

Open a new terminal in the `frontend` directory:

```bash
npm run dev
```

The frontend application will typically start on `http://localhost:5173`.

## Usage

1. Open your browser and navigate to the frontend URL.
2. Upload a video of a golf swing.
3. Wait for the AI to process the video.
4. View the analysis results, including the annotated video and swing metrics.
