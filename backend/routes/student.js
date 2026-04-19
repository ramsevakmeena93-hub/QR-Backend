const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

// Get student dashboard
router.get('/dashboard', authenticate, authorize('student'), async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate('subject')
      .populate('teacher', 'name email');

    const totalAttendance = await Attendance.countDocuments({ student: req.user._id });

    // Calculate attendance percentage
    const attendanceStats = await Promise.all(
      classes.map(async (cls) => {
        const totalSessions = await Attendance.distinct('qrSession', { class: cls._id });
        const studentAttendance = await Attendance.countDocuments({
          class: cls._id,
          student: req.user._id
        });

        return {
          classId: cls._id,
          className: cls.name,
          subject: cls.subject.name,
          attended: studentAttendance,
          total: totalSessions.length,
          percentage: totalSessions.length > 0 
            ? ((studentAttendance / totalSessions.length) * 100).toFixed(2) 
            : 0
        };
      })
    );

    res.json({
      totalClasses: classes.length,
      totalAttendance,
      classes,
      attendanceStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join class
router.post('/join-class', authenticate, authorize('student'), async (req, res) => {
  try {
    const { classCode } = req.body;

    const classData = await Class.findOne({ code: classCode.toUpperCase() });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classData.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    classData.students.push(req.user._id);
    await classData.save();

    res.json({ message: 'Successfully joined class', class: classData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's classes
router.get('/classes', authenticate, authorize('student'), async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate('subject')
      .populate('teacher', 'name email');

    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance history
router.get('/attendance', authenticate, authorize('student'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .populate({
        path: 'class',
        populate: { path: 'subject' }
      })
      .sort({ markedAt: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for specific class
router.get('/attendance/:classId', authenticate, authorize('student'), async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.user._id,
      class: req.params.classId
    })
      .populate('qrSession', 'createdAt')
      .sort({ markedAt: -1 });

    const totalSessions = await Attendance.distinct('qrSession', { 
      class: req.params.classId 
    });

    const percentage = totalSessions.length > 0
      ? ((attendance.length / totalSessions.length) * 100).toFixed(2)
      : 0;

    res.json({
      attendance,
      attended: attendance.length,
      total: totalSessions.length,
      percentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
