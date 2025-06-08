const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: [true, 'Please add a score']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks']
  },
  percentage: {
    type: Number,
    required: [true, 'Please add percentage']
  },
  passed: {
    type: Boolean,
    required: [true, 'Please specify whether the student passed']
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      selectedOption: {
        type: Number
      },
      isCorrect: {
        type: Boolean
      }
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique result per student per exam
ResultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);

module.exports = mongoose.model('Result', ResultSchema);