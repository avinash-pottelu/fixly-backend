require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { CORS_ORIGIN, NODE_ENV } = require('./config/constants');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const professionalRoutes = require('./routes/professional.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// ─── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 min
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔧 Fixly API is running.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

app.get('/api/health', async (req, res) => {
  const prisma = require('./config/database');
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: 'API healthy.', database: 'connected' });
  } catch {
    res.status(503).json({ success: false, message: 'Database unreachable.', database: 'disconnected' });
  }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
