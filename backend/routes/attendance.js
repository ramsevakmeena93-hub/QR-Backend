const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const QRSession = require('../models/QRSession');
const Class = require('../models/Class');

// Mark attendance by scanning QR
router.post('/mark', authenticate, authorize('student'), async (req, res) => {
  try {
    const { token, location, deviceInfo } = req.body;

    // Find QR session
    const qrSession = await QRSession.findOne({ token, isActive: true });

    if (!qrSession) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Check if expired
    if (new Date() > qrSession.expiresAt) {
      qrSession.isActive = false;
      await qrSession.save();
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if student is enrolled in class
    const classData = await Class.findById(qrSession.class);
    if (!classData.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    // Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student: req.user._id,
      qrSession: qrSession._id
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this session' });
    }

    // Mark attendance
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const attendance = new Attendance({
      student: req.user._id,
      class: qrSession.class,
      qrSession: qrSession._id,
      attendanceDate: today,
      markedBy: 'qr',
      location,
      deviceInfo
    });

    await attendance.save();

    // Update session count
    qrSession.attendanceCount += 1;
    await qrSession.save();

    res.json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get live attendance for a session
router.get('/live/:sessionId', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ qrSession: req.params.sessionId })
      .populate('student', 'name rollNumber')
      .sort({ markedAt: -1 });

    res.json({ attendance, count: attendance.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
