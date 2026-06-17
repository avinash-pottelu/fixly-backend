const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  // Prisma known errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return errorResponse(res, 409, `A record with this ${field} already exists.`);
  }
  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Record not found.');
  }
  if (err.code === 'P2003') {
    return errorResponse(res, 400, 'Foreign key constraint failed. Related record not found.');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired.');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, err.message);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  return errorResponse(res, statusCode, message);
};

const notFound = (req, res) => {
  return errorResponse(res, 404, `Route not found: ${req.method} ${req.url}`);
};

module.exports = { errorHandler, notFound };
