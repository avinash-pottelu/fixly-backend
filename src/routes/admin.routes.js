const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getPendingProfessionals,
  approveProfessional,
  rejectProfessional,
  getAllBookings,
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('ADMIN')); // All admin routes locked down

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/professionals/pending', getPendingProfessionals);
router.patch('/professionals/:id/approve', approveProfessional);
router.patch('/professionals/:id/reject', rejectProfessional);
router.get('/bookings', getAllBookings);

module.exports = router;
