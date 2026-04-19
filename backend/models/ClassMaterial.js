const mongoose = require('mongoose');

const classMaterialSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['notes', 'assignment', 'syllabus', 'reference', 'other'],
    default: 'notes'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ClassMaterial', classMaterialSchema);
