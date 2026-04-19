const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  qrSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSession',
    required: false // Not required for manual attendance
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  attendanceDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: String,
    enum: ['qr', 'manual'],
    default: 'qr'
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  deviceInfo: {
    userAgent: String,
    ip: String
  }
});

// Prevent duplicate attendance for same session (only for QR attendance)
attendanceSchema.index({ student: 1, qrSession: 1 }, { unique: true, sparse: true });

// Prevent duplicate attendance for same date (for manual attendance)
attendanceSchema.index({ student: 1, class: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
