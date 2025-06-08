const express = require('express');
const {
  getQuestions,
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getQuestions)
  .post(protect, authorize('admin'), addQuestion);

router
  .route('/:id')
  .get(getQuestion)
  .put(protect, authorize('admin'), updateQuestion)
  .delete(protect, authorize('admin'), deleteQuestion);

module.exports = router;