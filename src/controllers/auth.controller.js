const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { BCRYPT_SALT_ROUNDS } = require('../config/constants');

// ─── Customer Registration ───────────────────────────────────────────────────
const registerCustomer = async (req, res, next) => {
  try {
    const { full_name, email, phone, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse(res, 409, 'An account with this email already exists.');

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { full_name, email, phone, password: hashedPassword, role: 'CUSTOMER' },
      select: { id: true, full_name: true, email: true, phone: true, role: true, created_at: true },
    });

    const token = generateToken({ userId: user.id, role: user.role });
    return successResponse(res, 201, 'Customer registered successfully.', { user, token });
  } catch (err) {
    next(err);
  }
};

// ─── Professional Registration ────────────────────────────────────────────────
const registerProfessional = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, service_category, experience, pricing, location, city, state, bio } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse(res, 409, 'An account with this email already exists.');

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { full_name, email, phone, password: hashedPassword, role: 'PROFESSIONAL' },
        select: { id: true, full_name: true, email: true, phone: true, role: true, created_at: true },
      });

      const professional = await tx.professional.create({
        data: {
          user_id: user.id,
          service_category,
          experience: parseInt(experience),
          pricing: parseFloat(pricing),
          location,
          city,
          state,
          bio,
        },
      });

      return { user, professional };
    });

    const token = generateToken({ userId: result.user.id, role: result.user.role });
    return successResponse(res, 201, 'Professional registered successfully. Pending admin approval.', {
      user: result.user,
      professional: result.professional,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login (shared for all roles) ────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, 401, 'Invalid email or password.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 401, 'Invalid email or password.');

    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
    };

    // Attach professional profile if applicable
    let professional = null;
    if (user.role === 'PROFESSIONAL') {
      professional = await prisma.professional.findUnique({ where: { user_id: user.id } });
    }

    const token = generateToken({ userId: user.id, role: user.role });
    return successResponse(res, 200, 'Login successful.', { user: userData, professional, token });
  } catch (err) {
    next(err);
  }
};

// ─── Get Authenticated User ───────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, full_name: true, email: true, phone: true, role: true, created_at: true, professional: true },
    });
    return successResponse(res, 200, 'Authenticated user fetched.', user);
  } catch (err) {
    next(err);
  }
};

module.exports = { registerCustomer, registerProfessional, login, getMe };
