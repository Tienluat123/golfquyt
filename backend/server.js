const express = require('express');
const cors = require('cors');
const analyzeRoutes = require('./routes/analyze.route');
const authRoutes = require('./routes/auth.route');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.route');
const sessionRoutes = require('./routes/session.route');
const courseRoutes = require('./routes/course.route');

// Kết nối Database
connectDB();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/', analyzeRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);      
app.use('/sessions', sessionRoutes); 
app.use('/courses', courseRoutes);  


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
