const express = require('express');
const {
  getResults,
  getResult,
  submitExam,
  deleteResult
} = require('../controllers/resultController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getResults)
  .post(protect, authorize('student'), submitExam);

router
  .route('/:id')
  .get(protect, getResult)
  .delete(protect, authorize('admin'), deleteResult);

module.exports = router;