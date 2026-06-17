const express = require('express');
const router = express.Router();
const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/service.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), createService);
router.patch('/:id', authenticate, authorize('ADMIN'), updateService);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteService);

module.exports = router;
