const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// @desc    Get all results
// @route   GET /api/results
// @route   GET /api/exams/:examId/results
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    let query;

    // If the user is a student, they can only see their own results
    if (req.user.role === 'student') {
      if (req.params.examId) {
        query = Result.find({ 
          exam: req.params.examId,
          student: req.user.id
        });
      } else {
        query = Result.find({ student: req.user.id });
      }
    } else {
      // If user is admin, they can see all results
      if (req.params.examId) {
        query = Result.find({ exam: req.params.examId });
      } else {
        query = Result.find();
      }
    }
    
    // Populate with exam and student details
    query = query.populate({
      path: 'exam',
      select: 'title description duration'
    }).populate({
      path: 'student',
      select: 'name email'
    });

    const results = await query;

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'exam',
        select: 'title description duration'
      })
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'answers.question',
        select: 'text options correctAnswer marks'
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No result found with id of ${req.params.id}`
      });
    }

    // Make sure user has access to this result
    if (result.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this result'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Submit exam and create result
// @route   POST /api/exams/:examId/results
// @access  Private
exports.submitExam = async (req, res, next) => {
  try {
    req.body.exam = req.params.examId;
    req.body.student = req.user.id;

    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: `No exam found with id of ${req.params.examId}`
      });
    }
    
    // Check if user has already submitted this exam
    const existingResult = await Result.findOne({
      exam: req.params.examId,
      student: req.user.id
    });
    
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this exam'
      });
    }

    // Calculate score
    const questions = await Question.find({ exam: req.params.examId });
    let score = 0;
    let totalMarks = 0;

    // Process answers
    const processedAnswers = await Promise.all(req.body.answers.map(async (answer) => {
      const question = await Question.findById(answer.question);
      
      if (!question) {
        return {
          question: answer.question,
          selectedOption: answer.selectedOption,
          isCorrect: false
        };
      }

      const isCorrect = question.correctAnswer === answer.selectedOption;
      if (isCorrect) {
        score += question.marks;
      }
      totalMarks += question.marks;

      return {
        question: answer.question,
        selectedOption: answer.selectedOption,
        isCorrect
      };
    }));

    // Calculate percentage and passing status
    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= exam.passingPercentage;

    // Create the result
    const result = await Result.create({
      exam: req.params.examId,
      student: req.user.id,
      score,
      totalMarks,
      percentage,
      passed,
      answers: processedAnswers
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin only)
exports.deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No result found with id of ${req.params.id}`
      });
    }

    // Only admin can delete results
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete results'
      });
    }

    await Result.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};