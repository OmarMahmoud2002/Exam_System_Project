const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks for this exam']
  },
  passingPercentage: {
    type: Number,
    required: [true, 'Please add passing percentage'],
    min: [0, 'Passing percentage cannot be less than 0'],
    max: [100, 'Passing percentage cannot be more than 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
ExamSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'exam',
  justOne: false
});

// Cascade delete questions when an exam is deleted
ExamSchema.pre('remove', async function(next) {
  await this.model('Question').deleteMany({ exam: this._id });
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);