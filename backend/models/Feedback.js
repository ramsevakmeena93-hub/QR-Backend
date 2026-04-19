const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  },
  // Ratings (1-5 stars)
  teachingQuality: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  contentClarity: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  classroomEnvironment: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Text feedback
  comments: String,
  suggestions: String,
  // Anonymous option
  isAnonymous: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate overall rating before saving
feedbackSchema.pre('save', function(next) {
  this.overallRating = ((this.teachingQuality + this.contentClarity + this.classroomEnvironment) / 3).toFixed(1);
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
