const prisma = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// ─── Get All Professionals ────────────────────────────────────────────────────
const getAllProfessionals = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, city, min_rating, is_available } = req.query;

    const where = { verification_status: 'APPROVED' };
    if (category) where.service_category = category.toUpperCase();
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (min_rating) where.rating = { gte: parseFloat(min_rating) };
    if (is_available !== undefined) where.is_available = is_available === 'true';

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { full_name: true, email: true, phone: true } } },
        orderBy: { rating: 'desc' },
      }),
      prisma.professional.count({ where }),
    ]);

    return paginatedResponse(res, 'Professionals fetched.', professionals, getPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

// ─── Get Professional By ID ───────────────────────────────────────────────────
const getProfessionalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: { select: { full_name: true, email: true, phone: true, created_at: true } },
        reviews: {
          orderBy: { created_at: 'desc' },
          take: 10,
          select: { id: true, customer_name: true, rating: true, review_text: true, created_at: true },
        },
      },
    });

    if (!professional) return errorResponse(res, 404, 'Professional not found.');
    return successResponse(res, 200, 'Professional fetched.', professional);
  } catch (err) {
    next(err);
  }
};

// ─── Get My Professional Profile ──────────────────────────────────────────────
const getMyProfessionalProfile = async (req, res, next) => {
  try {
    const professional = await prisma.professional.findUnique({
      where: { user_id: req.user.id },
      include: { user: { select: { full_name: true, email: true, phone: true } } },
    });
    if (!professional) return errorResponse(res, 404, 'Professional profile not found.');
    return successResponse(res, 200, 'Professional profile fetched.', professional);
  } catch (err) {
    next(err);
  }
};

// ─── Update Professional Profile ─────────────────────────────────────────────
const updateProfessionalProfile = async (req, res, next) => {
  try {
    const { service_category, experience, pricing, location, city, state, bio, profile_image, is_available } = req.body;

    const professional = await prisma.professional.findUnique({ where: { user_id: req.user.id } });
    if (!professional) return errorResponse(res, 404, 'Professional profile not found.');

    const updated = await prisma.professional.update({
      where: { user_id: req.user.id },
      data: {
        ...(service_category && { service_category }),
        ...(experience !== undefined && { experience: parseInt(experience) }),
        ...(pricing !== undefined && { pricing: parseFloat(pricing) }),
        ...(location && { location }),
        ...(city && { city }),
        ...(state && { state }),
        ...(bio !== undefined && { bio }),
        ...(profile_image !== undefined && { profile_image }),
        ...(is_available !== undefined && { is_available: Boolean(is_available) }),
      },
    });

    return successResponse(res, 200, 'Professional profile updated.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Update Availability ──────────────────────────────────────────────────────
const updateAvailability = async (req, res, next) => {
  try {
    const { is_available } = req.body;
    if (typeof is_available !== 'boolean') {
      return errorResponse(res, 400, 'is_available must be a boolean.');
    }

    const updated = await prisma.professional.update({
      where: { user_id: req.user.id },
      data: { is_available },
      select: { id: true, is_available: true },
    });

    return successResponse(res, 200, `Availability set to ${is_available ? 'available' : 'unavailable'}.`, updated);
  } catch (err) {
    next(err);
  }
};

// ─── Get Professional Bookings ────────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const professional = await prisma.professional.findUnique({ where: { user_id: req.user.id } });
    if (!professional) return errorResponse(res, 404, 'Professional profile not found.');

    const where = { professional_id: professional.id };
    if (status) where.status = status.toUpperCase();

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { full_name: true, email: true, phone: true } },
          service: { select: { name: true, category: true } },
          review: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(res, 'Bookings fetched.', bookings, getPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProfessionals,
  getProfessionalById,
  getMyProfessionalProfile,
  updateProfessionalProfile,
  updateAvailability,
  getMyBookings,
};
