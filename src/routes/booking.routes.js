const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
} = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createBookingValidator } = require('../validators/booking.validator');

router.use(authenticate); // All booking routes require auth

// Customer routes
router.post('/', authorize('CUSTOMER'), createBookingValidator, validate, createBooking);
router.get('/', authorize('CUSTOMER'), getMyBookings);
router.get('/:id', getBookingById); // Customer, Professional, Admin
router.patch('/:id/cancel', authorize('CUSTOMER'), cancelBooking);

// Professional routes
router.patch('/:id/accept', authorize('PROFESSIONAL'), acceptBooking);
router.patch('/:id/reject', authorize('PROFESSIONAL'), rejectBooking);
router.patch('/:id/complete', authorize('PROFESSIONAL'), completeBooking);

module.exports = router;
