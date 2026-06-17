const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { BCRYPT_SALT_ROUNDS } = require('../config/constants');

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
        professional: true,
      },
    });
    if (!user) return errorResponse(res, 404, 'User not found.');
    return successResponse(res, 200, 'Profile fetched.', user);
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(full_name && { full_name }),
        ...(phone && { phone }),
      },
      select: { id: true, full_name: true, email: true, phone: true, role: true, updated_at: true },
    });

    return successResponse(res, 200, 'Profile updated successfully.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return errorResponse(res, 400, 'current_password and new_password are required.');
    }
    if (new_password.length < 8) {
      return errorResponse(res, 400, 'New password must be at least 8 characters.');
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return errorResponse(res, 400, 'Current password is incorrect.');

    const hashed = await bcrypt.hash(new_password, BCRYPT_SALT_ROUNDS);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    return successResponse(res, 200, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

// ─── Delete Account ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    return successResponse(res, 200, 'Account deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };
