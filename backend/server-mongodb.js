const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');
const qrRoutes = require('./routes/qr');
const attendanceRoutes = require('./routes/attendance');

// Import users data for initialization
const { users, subjects } = require('./users-data');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Class = require('./models/Class');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().then(async () => {
  // Initialize demo data if database is empty
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📝 Initializing database with demo data...');
      
      // Create users
      await User.insertMany(users);
      console.log(`✅ Created ${users.length} users`);
      
      // Create subjects
      const createdSubjects = await Subject.insertMany(subjects);
      console.log(`✅ Created ${subjects.length} subjects`);
      
      // Create classes for each subject with teachers
      const teachers = users.filter(u => u.role === 'teacher');
      const classesData = [];
      
      createdSubjects.forEach((subject, index) => {
        const teacher = teachers[index % teachers.length];
        classesData.push({
          name: subject.name,
          code: subject.code,
          subject: subject._id,
          teacher: teacher._id,
          students: users.filter(u => u.role === 'student').map(s => s._id),
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            time: '10:00 AM'
          }
        });
      });
      
      await Class.insertMany(classesData);
      console.log(`✅ Created ${classesData.length} classes`);
      
      console.log('🎉 Database initialization complete!');
    } else {
      console.log(`✅ Database already initialized with ${userCount} users`);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MITS Attendance System API is running',
    college: process.env.COLLEGE_NAME,
    database: 'MongoDB Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎓 MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE');
  console.log('📱 QR Code Based Attendance Management System');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`✅ Frontend: http://localhost:3000`);
  console.log(`💾 Database: MongoDB (mits-attendance)`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

module.exports = app;
