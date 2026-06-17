const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate); // All user routes require auth

// GET /api/users/profile
router.get('/profile', getProfile);

// PATCH /api/users/profile
router.patch('/profile', updateProfile);

// PATCH /api/users/change-password
router.patch('/change-password', changePassword);

// DELETE /api/users/account
router.delete('/account', deleteAccount);

module.exports = router;
