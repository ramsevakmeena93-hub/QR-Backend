const mongoose = require('mongoose');

const studentMarksSchema = new mongoose.Schema({
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
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'assignment', 'final', 'practical', 'other'],
    required: true
  },
  examName: String,
  marksObtained: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: Number,
  grade: String,
  remarks: String,
  examDate: Date,
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate percentage before saving
studentMarksSchema.pre('save', function(next) {
  if (this.marksObtained && this.totalMarks) {
    this.percentage = ((this.marksObtained / this.totalMarks) * 100).toFixed(2);
    
    // Calculate grade
    const percent = this.percentage;
    if (percent >= 90) this.grade = 'A+';
    else if (percent >= 80) this.grade = 'A';
    else if (percent >= 70) this.grade = 'B+';
    else if (percent >= 60) this.grade = 'B';
    else if (percent >= 50) this.grade = 'C';
    else if (percent >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('StudentMarks', studentMarksSchema);
