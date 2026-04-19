const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    id: String,
    name: String,
    email: String,
    role: String
  },
  action: {
    type: String,
    required: true
    // LOGIN, LOGOUT, QR_SCAN, ATTENDANCE_MARKED, QR_GENERATED,
    // PAGE_VISIT, FEEDBACK_SUBMITTED, MARKS_ADDED, MATERIAL_UPLOADED
  },
  details: String,       // human-readable description
  metadata: Object,      // extra data (classId, location, etc.)
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
