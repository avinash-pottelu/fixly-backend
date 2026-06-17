const prisma = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProfessionals,
      totalServices,
      totalBookings,
      pendingApprovals,
      completedBookings,
      pendingBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.professional.count(),
      prisma.service.count(),
      prisma.booking.count(),
      prisma.professional.count({ where: { verification_status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ]);

    return successResponse(res, 200, 'Dashboard stats fetched.', {
      users: { total_customers: totalUsers },
      professionals: {
        total: totalProfessionals,
        pending_approvals: pendingApprovals,
      },
      services: { total: totalServices },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { role, search } = req.query;

    const where = {};
    if (role) where.role = role.toUpperCase();
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, full_name: true, email: true, phone: true, role: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(res, 'Users fetched.', users, getPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

// ─── Delete User (Admin) ──────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return errorResponse(res, 404, 'User not found.');
    if (user.role === 'ADMIN') return errorResponse(res, 403, 'Cannot delete admin accounts.');
    await prisma.user.delete({ where: { id: req.params.id } });
    return successResponse(res, 200, 'User deleted.');
  } catch (err) {
    next(err);
  }
};

// ─── Get Pending Professionals ────────────────────────────────────────────────
const getPendingProfessionals = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where: { verification_status: 'PENDING' },
        skip,
        take: limit,
        include: { user: { select: { full_name: true, email: true, phone: true } } },
        orderBy: { created_at: 'asc' },
      }),
      prisma.professional.count({ where: { verification_status: 'PENDING' } }),
    ]);

    return paginatedResponse(res, 'Pending professionals fetched.', professionals, getPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

// ─── Approve Professional ─────────────────────────────────────────────────────
const approveProfessional = async (req, res, next) => {
  try {
    const professional = await prisma.professional.findUnique({ where: { id: req.params.id } });
    if (!professional) return errorResponse(res, 404, 'Professional not found.');
    if (professional.verification_status === 'APPROVED') {
      return errorResponse(res, 400, 'Professional is already approved.');
    }

    const updated = await prisma.professional.update({
      where: { id: req.params.id },
      data: { verification_status: 'APPROVED' },
      include: { user: { select: { full_name: true, email: true } } },
    });

    return successResponse(res, 200, 'Professional approved successfully.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Reject Professional ──────────────────────────────────────────────────────
const rejectProfessional = async (req, res, next) => {
  try {
    const professional = await prisma.professional.findUnique({ where: { id: req.params.id } });
    if (!professional) return errorResponse(res, 404, 'Professional not found.');

    const updated = await prisma.professional.update({
      where: { id: req.params.id },
      data: { verification_status: 'REJECTED' },
      include: { user: { select: { full_name: true, email: true } } },
    });

    return successResponse(res, 200, 'Professional rejected.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Get All Bookings (Admin) ─────────────────────────────────────────────────
const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;
    const where = status ? { status: status.toUpperCase() } : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { full_name: true, email: true } },
          professional: { include: { user: { select: { full_name: true } } } },
          service: { select: { name: true } },
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
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getPendingProfessionals,
  approveProfessional,
  rejectProfessional,
  getAllBookings,
};
