const { body } = require('express-validator');

const registerCustomerValidator = [
  body('full_name').trim().notEmpty().withMessage('Full name is required.').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone().withMessage('Please provide a valid phone number.'),
  body('password').notEmpty().withMessage('Password is required.').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number.'),
];

const registerProfessionalValidator = [
  body('full_name').trim().notEmpty().withMessage('Full name is required.').isLength({ min: 2, max: 100 }),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone().withMessage('Valid phone number required.'),
  body('password').notEmpty().isLength({ min: 8 }).withMessage('Password must be at least 8 characters.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number.'),
  body('service_category').notEmpty().withMessage('Service category is required.').isIn(['ELECTRICIAN','PLUMBER','CARPENTER','PAINTER','CLEANER','AC_REPAIR','APPLIANCE_REPAIR','HOME_MAINTENANCE']).withMessage('Invalid service category.'),
  body('experience').isInt({ min: 0, max: 50 }).withMessage('Experience must be 0-50 years.'),
  body('pricing').isFloat({ min: 0 }).withMessage('Pricing must be a positive number.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('state').trim().notEmpty().withMessage('State is required.'),
];

const loginValidator = [
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = { registerCustomerValidator, registerProfessionalValidator, loginValidator };
