const express = require('express');
const router = express.Router();
const { registerCustomer, registerProfessional, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  registerCustomerValidator,
  registerProfessionalValidator,
  loginValidator,
} = require('../validators/auth.validator');

// POST /api/auth/register/customer
router.post('/register/customer', registerCustomerValidator, validate, registerCustomer);

// POST /api/auth/register/professional
router.post('/register/professional', registerProfessionalValidator, validate, registerProfessional);

// POST /api/auth/login
router.post('/login', loginValidator, validate, login);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
