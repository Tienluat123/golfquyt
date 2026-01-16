const { spawn } = require('child_process');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

exports.runPythonScript = (scriptPath, args) => {
  return new Promise((resolve, reject) => {

    let pythonCommand = process.env.PYTHON_PATH || 'python3';

    // Resolve relative paths from the project root
    if (pythonCommand.startsWith('.')) {
      pythonCommand = path.resolve(process.cwd(), pythonCommand);
    }

    // If the configured python path doesn't exist, fallback to system python
    if (pythonCommand && !['python', 'python3'].includes(pythonCommand) && !fs.existsSync(pythonCommand)) {
      console.warn(`PYTHON_PATH not found at ${pythonCommand}. Falling back to 'python3'.`);
      pythonCommand = 'python3';
    }

    
    // If the scriptPath is inside the backend folder, run it as a module
    // from the backend root so package imports (services.*, pipeline.*) work.
    const backendRoot = path.resolve(__dirname, '..');
    const rel = path.relative(backendRoot, scriptPath);
    let spawnArgs = [];
    let options = { cwd: process.cwd() };

    if (rel && rel.endsWith('.py')) {
      const modName = rel.replace(/\\/g, '/').replace(/\//g, '.').replace(/\.py$/, '');
      // Only use -m for modules under the backend package (services, pipeline, etc.)
      if (modName.startsWith('services.') || modName.startsWith('pipeline.') || modName.startsWith('config')) {
        spawnArgs = ['-m', modName, ...args];
        options.cwd = backendRoot;
      } else {
        spawnArgs = [scriptPath, ...args];
      }
    } else {
      spawnArgs = [scriptPath, ...args];
    }

    let pythonProcess;
    try {
      pythonProcess = spawn(pythonCommand, spawnArgs, options);
    } catch (err) {
      return reject(new Error(`Failed to spawn python process: ${err.message}`));
    }

    // Handle spawn errors (e.g., ENOENT) to avoid uncaught exceptions
    pythonProcess.on('error', (err) => {
      return reject(new Error(`Python process error: ${err.message}`));
    });

    let dataString = '';
    let errorString = '';

    // Thu thập dữ liệu
    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => errorString += data.toString());

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script error (Code ${code}): ${errorString}`));
      }

      try {
        // Logic Regex tách JSON nằm gọn ở đây
        const match = dataString.match(/__JSON_START__(.*)__JSON_END__/s);
        if (match && match[1]) {
          resolve(JSON.parse(match[1]));
        } else {
          // Fallback nếu không bắt được JSON (trả về mặc định)
          resolve({ band: "Unknown", error: "No JSON output found" });
        }
      } catch (err) {
        reject(new Error(`Parse JSON failed: ${err.message}`));
      }
    });
  });
};
