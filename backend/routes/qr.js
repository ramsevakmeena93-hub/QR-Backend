const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const QRSession = require('../models/QRSession');
const Class = require('../models/Class');

// Generate QR code for attendance
router.post('/generate', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { classId } = req.body;

    // Verify class belongs to teacher
    const classData = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check daily QR generation limit (3 per day)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const todayCount = await QRSession.countDocuments({
      class: classId,
      teacher: req.user._id,
      generatedDate: today
    });

    if (todayCount >= 3) {
      return res.status(429).json({ 
        message: 'Daily QR generation limit reached (3/day). Please use manual attendance.',
        count: todayCount,
        limit: 3
      });
    }

    // Deactivate previous sessions for this class
    await QRSession.updateMany(
      { class: classId, isActive: true },
      { isActive: false }
    );

    // Create new session
    const token = uuidv4();
    const expirySeconds = parseInt(process.env.QR_EXPIRY_SECONDS) || 60;
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    const qrSession = new QRSession({
      class: classId,
      teacher: req.user._id,
      token,
      expiresAt,
      generatedDate: today
    });

    await qrSession.save();

    // Generate QR code
    const qrData = JSON.stringify({
      token,
      classId,
      timestamp: Date.now()
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    res.json({
      message: 'QR code generated successfully',
      qrCode: qrCodeUrl,
      sessionId: qrSession._id,
      expiresAt,
      expirySeconds,
      dailyCount: todayCount + 1,
      dailyLimit: 3
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active QR session
router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await QRSession.findById(req.params.sessionId)
      .populate('class')
      .populate('teacher', 'name');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
