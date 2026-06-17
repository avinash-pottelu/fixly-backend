const prisma = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const bookingInclude = {
  customer: { select: { full_name: true, email: true, phone: true } },
  professional: {
    include: { user: { select: { full_name: true, email: true, phone: true } } },
  },
  service: { select: { name: true, category: true } },
  review: true,
};

// ─── Create Booking ───────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { professional_id, service_id, booking_date, booking_time, address, notes } = req.body;

    // Verify professional exists and is approved
    const professional = await prisma.professional.findUnique({ where: { id: professional_id } });
    if (!professional) return errorResponse(res, 404, 'Professional not found.');
    if (professional.verification_status !== 'APPROVED') return errorResponse(res, 400, 'This professional is not yet approved.');
    if (!professional.is_available) return errorResponse(res, 400, 'This professional is currently unavailable.');

    // Verify service exists
    const service = await prisma.service.findUnique({ where: { id: service_id } });
    if (!service) return errorResponse(res, 404, 'Service not found.');

    // Check for conflicting bookings on same date/time
    const conflict = await prisma.booking.findFirst({
      where: {
        professional_id,
        booking_date: new Date(booking_date),
        booking_time,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (conflict) return errorResponse(res, 409, 'Professional already has a booking at this date and time.');

    const booking = await prisma.booking.create({
      data: {
        customer_id: req.user.id,
        professional_id,
        service_id,
        booking_date: new Date(booking_date),
        booking_time,
        address,
        notes,
        total_amount: professional.pricing,
      },
      include: bookingInclude,
    });

    return successResponse(res, 201, 'Booking created successfully.', booking);
  } catch (err) {
    next(err);
  }
};

// ─── Get Customer Bookings ────────────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const where = { customer_id: req.user.id };
    if (status) where.status = status.toUpperCase();

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({ where, skip, take: limit, include: bookingInclude, orderBy: { created_at: 'desc' } }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(res, 'Bookings fetched.', bookings, getPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

// ─── Get Booking By ID ────────────────────────────────────────────────────────
const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: bookingInclude });
    if (!booking) return errorResponse(res, 404, 'Booking not found.');

    // Ensure ownership — customer, professional, or admin
    const professional = req.user.role === 'PROFESSIONAL'
      ? await prisma.professional.findUnique({ where: { user_id: req.user.id } })
      : null;

    const isOwner =
      booking.customer_id === req.user.id ||
      (professional && booking.professional_id === professional.id) ||
      req.user.role === 'ADMIN';

    if (!isOwner) return errorResponse(res, 403, 'Access denied.');

    return successResponse(res, 200, 'Booking fetched.', booking);
  } catch (err) {
    next(err);
  }
};

// ─── Cancel Booking (Customer) ────────────────────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return errorResponse(res, 404, 'Booking not found.');
    if (booking.customer_id !== req.user.id) return errorResponse(res, 403, 'You can only cancel your own bookings.');
    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return errorResponse(res, 400, `Cannot cancel a booking with status: ${booking.status}.`);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: bookingInclude,
    });

    return successResponse(res, 200, 'Booking cancelled.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Accept Booking (Professional) ───────────────────────────────────────────
const acceptBooking = async (req, res, next) => {
  try {
    const professional = await prisma.professional.findUnique({ where: { user_id: req.user.id } });
    if (!professional) return errorResponse(res, 403, 'Professional profile not found.');

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return errorResponse(res, 404, 'Booking not found.');
    if (booking.professional_id !== professional.id) return errorResponse(res, 403, 'Access denied.');
    if (booking.status !== 'PENDING') return errorResponse(res, 400, `Cannot accept a booking with status: ${booking.status}.`);

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
      include: bookingInclude,
    });

    return successResponse(res, 200, 'Booking accepted.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Reject Booking (Professional) ───────────────────────────────────────────
const rejectBooking = async (req, res, next) => {
  try {
    const professional = await prisma.professional.findUnique({ where: { user_id: req.user.id } });
    if (!professional) return errorResponse(res, 403, 'Professional profile not found.');

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return errorResponse(res, 404, 'Booking not found.');
    if (booking.professional_id !== professional.id) return errorResponse(res, 403, 'Access denied.');
    if (booking.status !== 'PENDING') return errorResponse(res, 400, `Cannot reject a booking with status: ${booking.status}.`);

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
      include: bookingInclude,
    });

    return successResponse(res, 200, 'Booking rejected.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Complete Booking (Professional) ─────────────────────────────────────────
const completeBooking = async (req, res, next) => {
  try {
    const professional = await prisma.professional.findUnique({ where: { user_id: req.user.id } });
    if (!professional) return errorResponse(res, 403, 'Professional profile not found.');

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return errorResponse(res, 404, 'Booking not found.');
    if (booking.professional_id !== professional.id) return errorResponse(res, 403, 'Access denied.');
    if (booking.status !== 'ACCEPTED') return errorResponse(res, 400, 'Can only complete an accepted booking.');

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' },
      include: bookingInclude,
    });

    return successResponse(res, 200, 'Booking marked as completed.', updated);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
};
