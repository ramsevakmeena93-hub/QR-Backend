const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (/\.vercel\.app$/.test(origin) || /\.onrender\.com$/.test(origin) || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Server will continue without database (limited functionality)');
    // Don't exit - keep server running
  });

// ─── Schemas ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  department: String,
  rollNumber: String,
  employeeId: String,
  branch: String,
  section: String,
  admissionYear: Number,
  yearOfStudy: Number,
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  name: String,
  code: String,
  subject: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  department: String,
  semester: Number,
  academicYear: String,
  createdAt: { type: Date, default: Date.now }
});

const qrSessionSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  attendanceCount: { type: Number, default: 0 },
  lat: Number,
  lng: Number,
  generatedDate: String,
  createdAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  qrSession: { type: mongoose.Schema.Types.ObjectId, ref: 'QRSession' },
  status: { type: String, default: 'present' },
  location: Object,
  markedAt: { type: Date, default: Date.now }
});

const activityLogSchema = new mongoose.Schema({
  user: { id: String, name: String, email: String, role: String },
  action: String,
  details: String,
  metadata: Object,
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Class = mongoose.model('Class', classSchema);
const QRSession = mongoose.model('QRSession', qrSessionSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'mits2026secret';

const generateToken = (user) => jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const logActivity = async (data) => {
  try {
    await ActivityLog.create(data);
  } catch { /* silent */ }
};

// ─── Subjects (static) ────────────────────────────────────────────────────────
const subjects = [
  { _id: '1', name: 'Data Structures', code: '34251201' },
  { _id: '2', name: 'Object Oriented Programming', code: '34251202' },
  { _id: '3', name: 'Discrete Structures', code: '34251203' },
  { _id: '4', name: 'Probability and Random Processes', code: '34251204' },
  { _id: '5', name: 'Basic Electrical & Electronics Engineering', code: '34251205' },
  { _id: '6', name: 'Data Structures Lab', code: '34251206' },
  { _id: '7', name: 'Object Oriented Programmings Lab', code: '34251207' },
  { _id: '8', name: 'Electrical & Electronics Engineering Lab', code: '34251208' },
  { _id: '9', name: 'Semester Proficiency', code: '34251209' },
  { _id: '10', name: 'Micro Project-II', code: '34251210' },
  { _id: '11', name: 'Sustainability & Environmental Science', code: '34251211' }
];

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MITS Attendance System',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, rollNumber, employeeId, branch, section, admissionYear, yearOfStudy } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email: email.toLowerCase(), password: hashed,
      role, department, rollNumber, employeeId,
      branch, section, admissionYear, yearOfStudy
    });

    const token = generateToken(user);

    await logActivity({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      action: 'REGISTER',
      details: `${user.name} registered as ${user.role}`
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, rollNumber: user.rollNumber }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await logActivity({ user: { email, role: 'unknown' }, action: 'LOGIN_FAILED', details: `Failed login: ${email}` });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await logActivity({ user: { id: user._id, email, role: user.role }, action: 'LOGIN_FAILED', details: `Wrong password: ${email}` });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    await logActivity({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      action: 'LOGIN',
      details: `${user.name} logged in as ${user.role}`
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, rollNumber: user.rollNumber, employeeId: user.employeeId }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
app.get('/api/subjects', (req, res) => res.json({ subjects }));

// ─── TEACHER ROUTES ───────────────────────────────────────────────────────────
app.get('/api/teacher/dashboard', authenticate, async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id });
    const classIds = classes.map(c => c._id);
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAttendance = await Attendance.countDocuments({ class: { $in: classIds } });

    res.json({
      totalClasses: classes.length,
      totalStudents,
      totalAttendance,
      classes: classes.map(c => ({ _id: c._id, name: c.name, code: c.code, subject: c.subject }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/teacher/classes', authenticate, async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).populate('students', 'name rollNumber email');
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/teacher/class', authenticate, async (req, res) => {
  try {
    const { name, code, subject, department, semester, academicYear } = req.body;
    const allStudents = await User.find({ role: 'student' }).select('_id');
    const cls = await Class.create({
      name, code, subject, department: department || 'CST',
      semester: semester || 2, academicYear: academicYear || '2025-26',
      teacher: req.user._id,
      students: allStudents.map(s => s._id)
    });
    await logActivity({
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
      action: 'CLASS_CREATED', details: `Created class: ${name}`
    });
    res.status(201).json({ message: 'Class created', class: cls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── QR ROUTES ────────────────────────────────────────────────────────────────
app.post('/api/qr/generate', authenticate, async (req, res) => {
  try {
    const { classId, lat, lng } = req.body;
    const cls = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // Deactivate old sessions
    await QRSession.updateMany({ class: classId, isActive: true }, { isActive: false });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 8000);
    const today = new Date().toISOString().split('T')[0];

    const session = await QRSession.create({
      class: classId, teacher: req.user._id,
      token, expiresAt, isActive: true,
      generatedDate: today,
      ...(lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {})
    });

    setTimeout(async () => {
      await QRSession.findByIdAndUpdate(session._id, { isActive: false });
    }, 8000);

    const qrPayload = JSON.stringify({
      token, classId, className: cls.name, timestamp: Date.now(),
      ...(lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {})
    });

    const qrCodeImage = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2 });

    await logActivity({
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
      action: 'QR_GENERATED', details: `QR generated for ${cls.name}`,
      metadata: { classId, geoFenced: !!(lat && lng) }
    });

    res.json({
      message: 'QR code generated',
      qrCode: qrCodeImage, sessionId: session._id,
      expiresAt, expirySeconds: 8, geoFenced: !!(lat && lng)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ATTENDANCE ROUTES ────────────────────────────────────────────────────────
app.post('/api/attendance/mark', authenticate, async (req, res) => {
  try {
    const { token, location } = req.body;

    const session = await QRSession.findOne({ token, isActive: true });
    if (!session) return res.status(400).json({ message: 'QR code expired or invalid' });

    if (new Date() > session.expiresAt) {
      await QRSession.findByIdAndUpdate(session._id, { isActive: false });
      return res.status(400).json({ message: 'QR code has expired' });
    }

    const existing = await Attendance.findOne({ student: req.user._id, qrSession: session._id });
    if (existing) return res.status(400).json({ message: 'Attendance already marked' });

    const record = await Attendance.create({
      student: req.user._id, class: session.class,
      qrSession: session._id, location, status: 'present'
    });

    await QRSession.findByIdAndUpdate(session._id, { $inc: { attendanceCount: 1 } });

    const cls = await Class.findById(session.class);

    await logActivity({
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
      action: 'ATTENDANCE_MARKED',
      details: `${req.user.name} marked attendance for ${cls?.name}`,
      metadata: { classId: session.class, location }
    });

    res.json({ message: 'Attendance marked successfully!', attendance: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/attendance/live/:sessionId', authenticate, async (req, res) => {
  try {
    const records = await Attendance.find({ qrSession: req.params.sessionId })
      .populate('student', 'name rollNumber email');
    res.json({ attendance: records, count: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────
app.get('/api/student/dashboard', authenticate, async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id });
    const attendanceStats = await Promise.all(classes.map(async (cls) => {
      const sessions = await QRSession.countDocuments({ class: cls._id, isActive: false });
      const attended = await Attendance.countDocuments({ student: req.user._id, class: cls._id });
      const total = Math.max(sessions, attended);
      const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : '0.0';
      return {
        classId: cls._id, className: cls.code, subject: cls.name,
        attended, total, percentage, faculty: 'Faculty'
      };
    }));

    res.json({ totalClasses: classes.length, attendanceStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/student/attendance', authenticate, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user._id })
      .populate('class', 'name code').sort({ markedAt: -1 });
    res.json({ attendance: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ACTIVITY LOGS ────────────────────────────────────────────────────────────
app.post('/api/logs/track', async (req, res) => {
  try {
    const { userId, userName, userEmail, userRole, action, details, metadata } = req.body;
    const log = await ActivityLog.create({
      user: { id: userId, name: userName, email: userEmail, role: userRole },
      action, details, metadata,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const { role, action, limit = 200 } = req.query;
    const filter = {};
    if (role) filter['user.role'] = role;
    if (action) filter.action = action;
    const logs = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(parseInt(limit));
    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/logs/stats', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, todayCount, byAction] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.countDocuments({ timestamp: { $gte: today } }),
      ActivityLog.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }])
    ]);
    const byActionObj = {};
    byAction.forEach(a => { byActionObj[a._id] = a.count; });
    res.json({ total, today: todayCount, byAction: byActionObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
app.get('/api/admin/users', authenticate, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/stats', authenticate, async (req, res) => {
  try {
    const [students, teachers, classes, attendance] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Class.countDocuments(),
      Attendance.countDocuments()
    ]);
    res.json({ students, teachers, classes, attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🎓 MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE');
  console.log('📱 QR Attendance System — MongoDB Edition');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`💾 Database: MongoDB Atlas`);
  console.log('═══════════════════════════════════════════════════');
});
