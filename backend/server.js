const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for checking server status
app.get('/', (req, res) => {
  res.send('Golf Analyzer Backend is running! Use POST /analyze to upload videos.');
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename or add timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const { spawn } = require('child_process');

// Routes
app.post('/analyze', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('File uploaded:', req.file.path);
  
  // Đường dẫn file output
  const outputFilename = 'processed-' + req.file.filename;
  const outputPath = path.join('uploads', outputFilename);

  console.log('Starting AI processing...');

  // Gọi Python script để xử lý video
  const pythonProcess = spawn('python3', ['process_video.py', req.file.path, outputPath]);

  // Lắng nghe log từ Python (để debug)
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  // Khi Python chạy xong
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    
    if (code === 0) {
      // Trả về file đã xử lý
      const absoluteOutputPath = path.resolve(outputPath);
      res.sendFile(absoluteOutputPath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).json({ error: 'Error sending processed file' });
        }
      });
    } else {
      res.status(500).json({ error: 'Video processing failed' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
