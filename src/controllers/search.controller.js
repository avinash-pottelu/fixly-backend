const prisma = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// ─── Search Professionals ─────────────────────────────────────────────────────
const searchProfessionals = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { q, category, city, state, min_rating, max_price, min_price, sort_by } = req.query;

    const where = { verification_status: 'APPROVED', is_available: true };

    if (category) {
      where.service_category = category.toUpperCase();
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    if (min_rating) {
      where.rating = { ...where.rating, gte: parseFloat(min_rating) };
    }

    if (min_price || max_price) {
      where.pricing = {};
      if (min_price) where.pricing.gte = parseFloat(min_price);
      if (max_price) where.pricing.lte = parseFloat(max_price);
    }

    // Full-text search on location/city
    if (q) {
      where.OR = [
        { city: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { user: { full_name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Sort options
    const orderByMap = {
      rating: { rating: 'desc' },
      price_asc: { pricing: 'asc' },
      price_desc: { pricing: 'desc' },
      experience: { experience: 'desc' },
      newest: { created_at: 'desc' },
    };
    const orderBy = orderByMap[sort_by] || { rating: 'desc' };

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { full_name: true, phone: true } } },
        orderBy,
      }),
      prisma.professional.count({ where }),
    ]);

    return paginatedResponse(
      res,
      `Found ${total} professional(s).`,
      professionals,
      getPaginationMeta(total, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

// ─── Get Search Suggestions ───────────────────────────────────────────────────
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return errorResponse(res, 400, 'Query must be at least 2 characters.');

    const [cities, categories] = await Promise.all([
      prisma.professional.findMany({
        where: {
          verification_status: 'APPROVED',
          city: { contains: q, mode: 'insensitive' },
        },
        select: { city: true },
        distinct: ['city'],
        take: 5,
      }),
      prisma.service.findMany({
        where: { name: { contains: q, mode: 'insensitive' }, is_active: true },
        select: { name: true, category: true },
        take: 5,
      }),
    ]);

    return successResponse(res, 200, 'Suggestions fetched.', {
      cities: cities.map((c) => c.city),
      categories,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchProfessionals, getSearchSuggestions };
