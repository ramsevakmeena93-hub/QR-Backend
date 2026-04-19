const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const QRCode = require('qrcode');

dotenv.config();

const app = express();

// Middleware - Allow Vercel frontend + localhost
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      'https://srv-d7i7egsvirkc73ectgjg.onrender.com'
    ];
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app or onrender.com domain
    if (
      allowed.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /netlify\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now (tighten in production)
  },
  credentials: true
}));
app.use(express.json());

// Simple in-memory storage (temporary)
// Load all users from users-data.js (1 admin + 11 teachers + 70 students = 82 users)
const users = require('./users-data');
const classes = [];
const attendance = [];
const qrSessions = [];
const activityLogs = []; // Activity log storage

// ─── Activity Logger Helper ───────────────────────────────────────────────────
function logActivity({ userId, userName, userEmail, userRole, action, details, metadata = {}, req = null }) {
  const log = {
    _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    user: { id: userId, name: userName, email: userEmail, role: userRole },
    action,
    details,
    metadata,
    ip: req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') : 'system',
    userAgent: req ? req.headers['user-agent'] : 'system',
    timestamp: new Date()
  };
  activityLogs.unshift(log); // newest first
  if (activityLogs.length > 1000) activityLogs.pop(); // keep last 1000
  console.log(`[LOG] ${userRole?.toUpperCase()} ${userName} → ${action}: ${details}`);
  return log;
}
const subjects = [
  { _id: '1', name: 'Data Structures', code: '34251201', department: 'CST', credits: 4 },
  { _id: '2', name: 'Object Oriented Programming', code: '34251202', department: 'CST', credits: 4 },
  { _id: '3', name: 'Discrete Structures', code: '34251203', department: 'CST', credits: 4 },
  { _id: '4', name: 'Probability and Random Processes', code: '34251204', department: 'CST', credits: 4 },
  { _id: '5', name: 'Basic Electrical & Electronics Engineering', code: '34251205', department: 'CST', credits: 3 },
  { _id: '6', name: 'Data Structures Lab', code: '34251206', department: 'CST', credits: 2 },
  { _id: '7', name: 'Object Oriented Programmings Lab', code: '34251207', department: 'CST', credits: 2 },
  { _id: '8', name: 'Electrical & Electronics Engineering Lab', code: '34251208', department: 'CST', credits: 2 },
  { _id: '9', name: 'Semester Proficiency', code: '34251209', department: 'CST', credits: 1 },
  { _id: '10', name: 'Micro Project-II', code: '34251210', department: 'CST', credits: 2 },
  { _id: '11', name: 'Sustainability & Environmental Science', code: '34251211', department: 'CST', credits: 3 }
];

// No demo data — all data is real (created by teachers/admin)
console.log(`✅ Server initialized: ${users.length} users, ${subjects.length} subjects loaded`);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MITS Attendance System API is running',
    college: 'Madhav Institute of Technology & Science',
    users: users.length,
    subjects: subjects.length,
    classes: classes.length,
    attendance: attendance.length
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, department, rollNumber, employeeId } = req.body;
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = {
    id: Date.now().toString(),
    name,
    email,
    password, // In real app, this would be hashed
    role,
    department,
    rollNumber,
    employeeId
  };

  users.push(user);

  res.status(201).json({
    message: 'User registered successfully (Demo Mode)',
    token: 'demo-token-' + user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    logActivity({
      userId: 'unknown', userName: 'Unknown', userEmail: email,
      userRole: 'unknown', action: 'LOGIN_FAILED',
      details: `Failed login attempt for ${email}`, req
    });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  logActivity({
    userId: user.id, userName: user.name, userEmail: user.email,
    userRole: user.role, action: 'LOGIN',
    details: `${user.name} logged in as ${user.role}`, req
  });

  res.json({
    message: 'Login successful (Demo Mode)',
    token: 'demo-token-' + user.id,
    user: {
      id: user.id, name: user.name, email: user.email,
      role: user.role, department: user.department,
      rollNumber: user.rollNumber, employeeId: user.employeeId
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Demo: return first user or create admin
  let user = users.find(u => u.role === 'admin');
  
  if (!user) {
    user = {
      id: '1',
      name: 'Demo Admin',
      email: 'admin@demo.com',
      role: 'admin',
      department: 'Administration'
    };
    users.push(user);
  }

  res.json({ user });
});

// Admin routes
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    stats: {
      totalTeachers: users.filter(u => u.role === 'teacher').length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalClasses: classes.length,
      totalAttendance: 0,
      totalSubjects: subjects.length
    },
    recentAttendance: [],
    lowAttendanceStudents: []
  });
});

app.get('/api/admin/teachers', (req, res) => {
  const teachers = users.filter(u => u.role === 'teacher');
  res.json({ teachers });
});

app.get('/api/admin/students', (req, res) => {
  const students = users.filter(u => u.role === 'student');
  res.json({ students });
});

app.post('/api/admin/subject', (req, res) => {
  const subject = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date()
  };
  subjects.push(subject);
  res.status(201).json({ message: 'Subject created', subject });
});

app.get('/api/admin/subjects', (req, res) => {
  res.json({ subjects });
});

// Teacher routes
app.get('/api/teacher/dashboard', (req, res) => {
  res.json({
    totalClasses: classes.length,
    totalStudents: 0,
    totalAttendance: 0,
    classes: classes
  });
});

app.get('/api/teacher/classes', (req, res) => {
  res.json({ classes });
});

app.post('/api/teacher/class', (req, res) => {
  const { name, code, subjectId, department, semester, academicYear } = req.body;
  
  const subject = subjects.find(s => s._id === subjectId);
  
  const newClass = {
    _id: Date.now().toString(),
    name,
    code: code.toUpperCase(),
    subject: subject,
    teacher: req.body.teacherId || '1',
    department,
    semester,
    academicYear,
    students: [],
    createdAt: new Date()
  };
  
  classes.push(newClass);
  
  res.status(201).json({ 
    message: 'Class created successfully (Demo Mode)', 
    class: newClass 
  });
});

app.get('/api/teacher/class/:classId', (req, res) => {
  const classData = classes.find(c => c._id === req.params.classId);
  
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }
  
  res.json({ class: classData });
});

// Student routes
app.get('/api/student/dashboard', (req, res) => {
  const studentId = req.header('X-Student-Id') || 'S1007'; // Default to Ajay Meena
  
  const studentClasses = classes.filter(c => c.students && c.students.includes(studentId));
  const studentAttendance = attendance.filter(a => a.student === studentId);
  
  const attendanceStats = studentClasses.map(cls => {
    const classAttendance = attendance.filter(a => a.class === cls._id && a.student === studentId);
    const totalSessions = qrSessions.filter(s => s.class === cls._id).length;
    
    return {
      classId: cls._id,
      className: cls.code,
      subject: cls.subject?.name || 'N/A',
      attended: classAttendance.length,
      total: totalSessions,
      percentage: totalSessions > 0 ? ((classAttendance.length / totalSessions) * 100).toFixed(1) : '0',
      faculty: cls.faculty || 'Not Assigned'
    };
  });
  
  res.json({
    totalClasses: studentClasses.length,
    totalAttendance: studentAttendance.length,
    classes: studentClasses,
    attendanceStats: attendanceStats
  });
});

app.get('/api/student/classes', (req, res) => {
  const studentId = req.header('X-Student-Id') || '3';
  const studentClasses = classes.filter(c => c.students && c.students.includes(studentId));
  res.json({ classes: studentClasses });
});

app.post('/api/student/join-class', (req, res) => {
  const { classCode, studentId } = req.body;
  const sid = studentId || '3';
  
  const classData = classes.find(c => c.code === classCode.toUpperCase());
  
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }
  
  if (!classData.students) {
    classData.students = [];
  }
  
  if (classData.students.includes(sid)) {
    return res.status(400).json({ message: 'Already enrolled in this class' });
  }
  
  classData.students.push(sid);
  
  res.json({
    message: 'Successfully joined class',
    class: classData
  });
});

app.get('/api/student/attendance', (req, res) => {
  const studentId = req.header('X-Student-Id') || '3';
  const studentAttendance = attendance.filter(a => a.student === studentId);
  
  const attendanceWithDetails = studentAttendance.map(a => {
    const classData = classes.find(c => c._id === a.class);
    return {
      ...a,
      class: {
        name: classData?.name,
        subject: classData?.subject
      }
    };
  });
  
  res.json({ attendance: attendanceWithDetails });
});

// QR routes
app.post('/api/qr/generate', async (req, res) => {
  const { classId, lat, lng } = req.body;
  
  const classData = classes.find(c => c._id === classId);
  if (!classData) {
    return res.status(404).json({ message: 'Class not found' });
  }
  
  // Create QR session with 8 second expiry
  const sessionId = Date.now().toString();
  const token = 'QR-' + sessionId;
  const expiresAt = new Date(Date.now() + 8000);
  
  const qrSession = {
    _id: sessionId,
    class: classId,
    token: token,
    expiresAt: expiresAt,
    isActive: true,
    attendanceCount: 0,
    createdAt: new Date()
  };
  
  qrSessions.push(qrSession);
  
  setTimeout(() => {
    const session = qrSessions.find(s => s._id === sessionId);
    if (session) session.isActive = false;
  }, 8000);
  
  // Embed classroom GPS location in QR if teacher provided it
  const qrPayload = {
    token: token,
    classId: classId,
    className: classData.name,
    timestamp: Date.now(),
    ...(lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {})
  };
  
  const qrData = JSON.stringify(qrPayload);
  
  try {
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300, margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    res.json({
      message: 'QR code generated',
      qrCode: qrCodeImage,
      qrData: qrData,
      sessionId: sessionId,
      expiresAt: expiresAt,
      expirySeconds: 8,
      geoFenced: !!(lat && lng)
    });

    // Log QR generation (get teacher from auth header)
    const authHeader = req.headers.authorization;
    const token2 = authHeader?.split(' ')[1];
    const teacher = token2 ? users.find(u => 'demo-token-' + u.id === token2) : null;
    if (teacher) {
      logActivity({
        userId: teacher.id, userName: teacher.name, userEmail: teacher.email,
        userRole: 'teacher', action: 'QR_GENERATED',
        details: `${teacher.name} generated QR for class ${classData.name}`,
        metadata: { classId, geoFenced: !!(lat && lng) }, req
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Attendance routes
app.post('/api/attendance/mark', (req, res) => {
  const { token, studentId } = req.body;
  
  // Find QR session
  const qrSession = qrSessions.find(s => s.token === token && s.isActive);
  
  if (!qrSession) {
    return res.status(400).json({ message: 'QR code expired or invalid' });
  }
  
  // Check if already marked
  const existingAttendance = attendance.find(
    a => a.student === studentId && a.qrSession === qrSession._id
  );
  
  if (existingAttendance) {
    return res.status(400).json({ message: 'Attendance already marked' });
  }
  
  // Mark attendance
  const newAttendance = {
    _id: Date.now().toString(),
    student: studentId,
    class: qrSession.class,
    qrSession: qrSession._id,
    status: 'present',
    markedAt: new Date()
  };
  
  attendance.push(newAttendance);
  qrSession.attendanceCount += 1;
  
  // Get student and class info
  const student = users.find(u => u.id === studentId);
  const classData = classes.find(c => c._id === qrSession.class);

  // Log attendance
  logActivity({
    userId: studentId, userName: student?.name || studentId,
    userEmail: student?.email, userRole: 'student',
    action: 'ATTENDANCE_MARKED',
    details: `${student?.name} marked attendance for ${classData?.name || qrSession.class}`,
    metadata: { classId: qrSession.class, className: classData?.name, location: req.body.location },
    req
  });
  
  res.json({
    message: 'Attendance marked successfully!',
    attendance: {
      ...newAttendance,
      studentName: student?.name,
      className: classData?.name
    }
  });
});

app.get('/api/attendance/live/:sessionId', (req, res) => {
  const sessionAttendance = attendance.filter(a => a.qrSession === req.params.sessionId);
  
  const attendanceWithDetails = sessionAttendance.map(a => {
    const student = users.find(u => u.id === a.student);
    return {
      ...a,
      student: { name: student?.name, rollNumber: student?.rollNumber }
    };
  });
  
  res.json({ attendance: attendanceWithDetails, count: attendanceWithDetails.length });
});

// ─── Activity Log API ─────────────────────────────────────────────────────────
// Log a frontend action (Google login, page visit, etc.)
app.post('/api/logs/track', (req, res) => {
  const { userId, userName, userEmail, userRole, action, details, metadata } = req.body;
  const log = logActivity({ userId, userName, userEmail, userRole, action, details, metadata, req });
  res.json({ success: true, log });
});

// Get all logs (admin only)
app.get('/api/logs', (req, res) => {
  const { role, action, limit = 100, page = 1 } = req.query;
  let filtered = [...activityLogs];
  if (role) filtered = filtered.filter(l => l.user.role === role);
  if (action) filtered = filtered.filter(l => l.action === action);
  const total = filtered.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = filtered.slice(start, start + parseInt(limit));
  res.json({ logs: paginated, total, page: parseInt(page), limit: parseInt(limit) });
});

// Get logs for a specific user
app.get('/api/logs/user/:userId', (req, res) => {
  const userLogs = activityLogs.filter(l => l.user.id === req.params.userId);
  res.json({ logs: userLogs.slice(0, 50) });
});

// Get activity summary stats
app.get('/api/logs/stats', (req, res) => {
  const today = new Date().toDateString();
  const todayLogs = activityLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  
  res.json({
    total: activityLogs.length,
    today: todayLogs.length,
    byAction: activityLogs.reduce((acc, l) => {
      acc[l.action] = (acc[l.action] || 0) + 1;
      return acc;
    }, {}),
    byRole: activityLogs.reduce((acc, l) => {
      acc[l.user.role] = (acc[l.user.role] || 0) + 1;
      return acc;
    }, {}),
    recentUsers: [...new Map(activityLogs.slice(0, 20).map(l => [l.user.id, l.user])).values()].slice(0, 10)
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🎓 MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE');
  console.log('📱 QR Code Based Attendance Management System');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👥 Users loaded: ${users.length} (real data)`);
  console.log(`📚 Subjects: ${subjects.length}`);
  console.log(`✅ No dummy data — system is clean`);
  console.log('═══════════════════════════════════════════════════');
});
