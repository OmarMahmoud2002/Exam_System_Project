const Question = require('../models/Question');
const Exam = require('../models/Exam');

// @desc    Get all questions
// @route   GET /api/questions
// @route   GET /api/exams/:examId/questions
// @access  Public
exports.getQuestions = async (req, res, next) => {
  try {
    let query;

    if (req.params.examId) {
      query = Question.find({ exam: req.params.examId });
    } else {
      query = Question.find().populate({
        path: 'exam',
        select: 'title description'
      });
    }

    const questions = await query;

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate({
      path: 'exam',
      select: 'title description'
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `No question found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add question
// @route   POST /api/exams/:examId/questions
// @access  Private
exports.addQuestion = async (req, res, next) => {
  try {
    req.body.exam = req.params.examId;

    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: `No exam found with id of ${req.params.examId}`
      });
    }

    // Make sure user is exam creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to add a question to exam ${exam._id}`
      });
    }

    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `No question found with id of ${req.params.id}`
      });
    }

    // Make sure user is exam creator or admin
    const exam = await Exam.findById(question.exam);
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update question ${question._id}`
      });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `No question found with id of ${req.params.id}`
      });
    }

    // Make sure user is exam creator or admin
    const exam = await Exam.findById(question.exam);
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete question ${question._id}`
      });
    }

    await question.remove();

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