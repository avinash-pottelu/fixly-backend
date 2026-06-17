const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, full_name: true },
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid token. User not found.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token.');
    }
    return errorResponse(res, 500, 'Authentication error.');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, `Access denied. Requires role: ${roles.join(' or ')}.`);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
