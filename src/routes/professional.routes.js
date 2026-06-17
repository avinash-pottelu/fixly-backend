const express = require('express');
const router = express.Router();
const {
  getAllProfessionals,
  getProfessionalById,
  getMyProfessionalProfile,
  updateProfessionalProfile,
  updateAvailability,
  getMyBookings,
} = require('../controllers/professional.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllProfessionals);
router.get('/:id', getProfessionalById);

// Protected professional routes
router.get('/me/profile', authenticate, authorize('PROFESSIONAL'), getMyProfessionalProfile);
router.patch('/me/profile', authenticate, authorize('PROFESSIONAL'), updateProfessionalProfile);
router.patch('/me/availability', authenticate, authorize('PROFESSIONAL'), updateAvailability);
router.get('/me/bookings', authenticate, authorize('PROFESSIONAL'), getMyBookings);

module.exports = router;
