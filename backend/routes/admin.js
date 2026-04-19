const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// Get admin dashboard stats
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClasses = await Class.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Get recent attendance
    const recentAttendance = await Attendance.find()
      .populate('student', 'name rollNumber')
      .populate({
        path: 'class',
        populate: { path: 'subject' }
      })
      .sort({ markedAt: -1 })
      .limit(10);

    // Low attendance students
    const students = await User.find({ role: 'student' });
    const lowAttendanceStudents = [];

    for (const student of students) {
      const studentClasses = await Class.find({ students: student._id });
      let totalSessions = 0;
      let attendedSessions = 0;

      for (const cls of studentClasses) {
        const sessions = await Attendance.distinct('qrSession', { class: cls._id });
        const attended = await Attendance.countDocuments({
          class: cls._id,
          student: student._id
        });
        totalSessions += sessions.length;
        attendedSessions += attended;
      }

      const percentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

      if (percentage < 75 && totalSessions > 0) {
        lowAttendanceStudents.push({
          student: {
            name: student.name,
            rollNumber: student.rollNumber,
            department: student.department
          },
          percentage: percentage.toFixed(2),
          attended: attendedSessions,
          total: totalSessions
        });
      }
    }

    res.json({
      stats: {
        totalTeachers,
        totalStudents,
        totalClasses,
        totalAttendance,
        totalSubjects
      },
      recentAttendance,
      lowAttendanceStudents: lowAttendanceStudents.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add teacher
router.post('/teacher', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, department, employeeId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const teacher = new User({
      name,
      email,
      password,
      role: 'teacher',
      department,
      employeeId
    });

    await teacher.save();

    res.status(201).json({ message: 'Teacher added successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add student
router.post('/student', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, department, rollNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const student = new User({
      name,
      email,
      password,
      role: 'student',
      department,
      rollNumber
    });

    await student.save();

    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all teachers
router.get('/teachers', authenticate, authorize('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students
router.get('/students', authenticate, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create subject
router.post('/subject', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, code, department, credits, description } = req.body;

    const subject = new Subject({
      name,
      code,
      department,
      credits,
      description
    });

    await subject.save();

    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all subjects
router.get('/subjects', authenticate, authorize('admin'), async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendance
router.get('/attendance', authenticate, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('student', 'name rollNumber department')
      .populate({
        path: 'class',
        populate: { path: 'subject teacher' }
      })
      .sort({ markedAt: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/user/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
