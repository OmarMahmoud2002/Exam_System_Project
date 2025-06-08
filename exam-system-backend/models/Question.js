const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add question text'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Please add options'],
    validate: [arrayMinLength, 'At least 2 options are required']
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Please specify the correct answer index'],
    min: [0, 'Correct answer index must be non-negative'],
  },
  marks: {
    type: Number,
    required: [true, 'Please add marks for this question'],
    default: 1
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate that options array has at least 2 elements
function arrayMinLength(val) {
  return val.length >= 2;
}

module.exports = mongoose.model('Question', QuestionSchema);