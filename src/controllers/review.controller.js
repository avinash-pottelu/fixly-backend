const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// Recalculate and persist avg rating for a professional
const recalculateRating = async (professional_id) => {
  const result = await prisma.review.aggregate({
    where: { professional_id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.professional.update({
    where: { id: professional_id },
    data: {
      rating: result._avg.rating ? parseFloat(result._avg.rating.toFixed(2)) : 0,
      total_reviews: result._count.rating,
    },
  });
};

// ─── Create Review ────────────────────────────────────────────────────────────
const createReview = async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    const { rating, review_text } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { customer: { select: { full_name: true } } },
    });

    if (!booking) return errorResponse(res, 404, 'Booking not found.');
    if (booking.customer_id !== req.user.id) return errorResponse(res, 403, 'You can only review your own bookings.');
    if (booking.status !== 'COMPLETED') return errorResponse(res, 400, 'You can only review completed bookings.');

    const existing = await prisma.review.findUnique({ where: { booking_id } });
    if (existing) return errorResponse(res, 409, 'You have already reviewed this booking.');

    const review = await prisma.review.create({
      data: {
        booking_id,
        professional_id: booking.professional_id,
        customer_name: booking.customer.full_name,
        rating: parseInt(rating),
        review_text,
      },
    });

    await recalculateRating(booking.professional_id);

    return successResponse(res, 201, 'Review submitted successfully.', review);
  } catch (err) {
    next(err);
  }
};

// ─── Update Review ────────────────────────────────────────────────────────────
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
      include: { booking: { select: { customer_id: true } } },
    });
    if (!review) return errorResponse(res, 404, 'Review not found.');
    if (review.booking.customer_id !== req.user.id) return errorResponse(res, 403, 'Access denied.');

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(review_text !== undefined && { review_text }),
      },
    });

    await recalculateRating(review.professional_id);
    return successResponse(res, 200, 'Review updated.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: { booking: { select: { customer_id: true } } },
    });
    if (!review) return errorResponse(res, 404, 'Review not found.');

    const isOwner = review.booking.customer_id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) return errorResponse(res, 403, 'Access denied.');

    const professionalId = review.professional_id;
    await prisma.review.delete({ where: { id } });
    await recalculateRating(professionalId);

    return successResponse(res, 200, 'Review deleted.');
  } catch (err) {
    next(err);
  }
};

// ─── Get Reviews For Professional ─────────────────────────────────────────────
const getProfessionalReviews = async (req, res, next) => {
  try {
    const { professional_id } = req.params;

    const [reviews, professional] = await Promise.all([
      prisma.review.findMany({
        where: { professional_id },
        orderBy: { created_at: 'desc' },
      }),
      prisma.professional.findUnique({
        where: { id: professional_id },
        select: { rating: true, total_reviews: true },
      }),
    ]);

    return successResponse(res, 200, 'Reviews fetched.', { reviews, summary: professional });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, updateReview, deleteReview, getProfessionalReviews };
