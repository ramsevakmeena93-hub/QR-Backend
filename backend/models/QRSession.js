const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attendanceCount: {
    type: Number,
    default: 0
  },
  generatedDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-expire index
qrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('QRSession', qrSessionSchema);
