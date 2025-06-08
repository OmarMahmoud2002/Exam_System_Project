const express = require('express');
const { 
  getExams, 
  getExam, 
  createExam, 
  updateExam, 
  deleteExam 
} = require('../controllers/examController');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const questionRouter = require('./questions');
const resultRouter = require('./results');

const router = express.Router();

// Re-route into other resource routers
router.use('/:examId/questions', questionRouter);
router.use('/:examId/results', resultRouter);

router
  .route('/')
  .get(getExams)
  .post(protect, authorize('admin'), createExam);

router
  .route('/:id')
  .get(getExam)
  .put(protect, authorize('admin'), updateExam)
  .delete(protect, authorize('admin'), deleteExam);

module.exports = router;