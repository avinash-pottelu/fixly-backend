require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');
const { PORT, NODE_ENV } = require('./config/constants');

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🔧 Fixly Backend Server');
      console.log('─────────────────────────────');
      console.log(`🚀 Running on Port : ${PORT}`);
      console.log(`🌍 Environment     : ${NODE_ENV}`);
      console.log(`📡 API Base        : /api`);
      console.log(`💊 Health Check    : /api/health`);
      console.log('─────────────────────────────');
      console.log('');
    });

    const shutdown = async (signal) => {
      console.log(`\n[${signal}] Shutting down gracefully...`);

      server.close(async () => {
        await prisma.$disconnect();
        console.log('👋 Database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('💥 Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();