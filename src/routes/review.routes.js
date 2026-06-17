const express = require('express');
const router = express.Router();
const { createReview, updateReview, deleteReview, getProfessionalReviews } = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReviewValidator, updateReviewValidator } = require('../validators/review.validator');

// Public
router.get('/professional/:professional_id', getProfessionalReviews);

// Protected
router.post('/booking/:booking_id', authenticate, authorize('CUSTOMER'), createReviewValidator, validate, createReview);
router.patch('/:id', authenticate, authorize('CUSTOMER'), updateReviewValidator, validate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
