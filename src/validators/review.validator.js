const { body } = require('express-validator');

const createReviewValidator = [
  body('rating').notEmpty().withMessage('Rating is required.').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('review_text').optional().trim().isLength({ max: 1000 }).withMessage('Review text cannot exceed 1000 characters.'),
];

const updateReviewValidator = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('review_text').optional().trim().isLength({ max: 1000 }).withMessage('Review text cannot exceed 1000 characters.'),
];

module.exports = { createReviewValidator, updateReviewValidator };
