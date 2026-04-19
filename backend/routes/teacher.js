const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const QRSession = require('../models/QRSession');
const User = require('../models/User');

// Get teacher dashboard stats
router.get('/dashboard', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('subject')
      .populate('students', 'name rollNumber');

    const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
    
    const totalAttendance = await Attendance.countDocuments({
      class: { $in: classes.map(c => c._id) }
    });

    res.json({
      totalClasses: classes.length,
      totalStudents,
      totalAttendance,
      classes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create class
router.post('/class', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { name, code, subjectId, department, semester, academicYear, schedule } = req.body;

    const newClass = new Class({
      name,
      code,
      subject: subjectId,
      teacher: req.user._id,
      department,
      semester,
      academicYear,
      schedule
    });

    await newClass.save();
    await newClass.populate('subject');

    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get teacher's classes
router.get('/classes', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('subject')
      .populate('students', 'name rollNumber email');

    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get class details
router.get('/class/:classId', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const classData = await Class.findOne({ 
      _id: req.params.classId, 
      teacher: req.user._id 
    })
      .populate('subject')
      .populate('students', 'name rollNumber email');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ class: classData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add students to class
router.post('/class/:classId/students', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { studentIds } = req.body;

    const classData = await Class.findOneAndUpdate(
      { _id: req.params.classId, teacher: req.user._id },
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    ).populate('students', 'name rollNumber email');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Students added successfully', class: classData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance history for a class
router.get('/class/:classId/attendance', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ class: req.params.classId })
      .populate('student', 'name rollNumber')
      .populate('qrSession', 'createdAt')
      .sort({ markedAt: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check QR generation count for today
router.get('/class/:classId/qr-count', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const count = await QRSession.countDocuments({
      class: req.params.classId,
      teacher: req.user._id,
      generatedDate: today
    });

    res.json({ count, limit: 3, remaining: Math.max(0, 3 - count) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit manual attendance
router.post('/class/:classId/manual-attendance', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { attendanceDate, presentStudents, absentStudents } = req.body;

    // Verify class belongs to teacher
    const classData = await Class.findOne({ 
      _id: req.params.classId, 
      teacher: req.user._id 
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Delete existing attendance for this date (if any)
    await Attendance.deleteMany({
      class: req.params.classId,
      attendanceDate: attendanceDate
    });

    // Create attendance records
    const attendanceRecords = [];

    // Mark present students
    for (const studentId of presentStudents) {
      attendanceRecords.push({
        student: studentId,
        class: req.params.classId,
        status: 'present',
        attendanceDate: attendanceDate,
        markedBy: 'manual',
        markedAt: new Date()
      });
    }

    // Mark absent students
    for (const studentId of absentStudents) {
      attendanceRecords.push({
        student: studentId,
        class: req.params.classId,
        status: 'absent',
        attendanceDate: attendanceDate,
        markedBy: 'manual',
        markedAt: new Date()
      });
    }

    // Insert all records
    await Attendance.insertMany(attendanceRecords);

    res.json({ 
      message: 'Attendance submitted successfully',
      totalPresent: presentStudents.length,
      totalAbsent: absentStudents.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get students for manual attendance
router.get('/class/:classId/students', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const classData = await Class.findOne({ 
      _id: req.params.classId, 
      teacher: req.user._id 
    }).populate('students', 'name rollNumber email');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get all students from the system (BTTC25O1002 to BTTC25O1076)
    const allStudents = await User.find({ 
      role: 'student',
      rollNumber: { $regex: /^BTTC25O1/ }
    }).select('name rollNumber email').sort({ rollNumber: 1 });

    res.json({ students: allStudents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for specific date
router.get('/class/:classId/attendance/:date', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      class: req.params.classId,
      attendanceDate: req.params.date
    }).populate('student', 'name rollNumber');

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
