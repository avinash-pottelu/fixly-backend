const { body } = require('express-validator');

const createBookingValidator = [
  body('professional_id').notEmpty().withMessage('Professional ID is required.').isUUID().withMessage('Invalid professional ID.'),
  body('service_id').notEmpty().withMessage('Service ID is required.').isUUID().withMessage('Invalid service ID.'),
  body('booking_date').notEmpty().withMessage('Booking date is required.').isISO8601().withMessage('Invalid date format. Use ISO8601.').custom((value) => {
    if (new Date(value) < new Date()) throw new Error('Booking date must be in the future.');
    return true;
  }),
  body('booking_time').notEmpty().withMessage('Booking time is required.').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM format.'),
  body('address').trim().notEmpty().withMessage('Address is required.').isLength({ min: 10 }).withMessage('Address is too short.'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
];

module.exports = { createBookingValidator };
