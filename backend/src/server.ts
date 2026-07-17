import http from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import app from './app';
import connectDB from './config/db';
import { initializeSocket } from './sockets';
import logger from './utils/logger';
import env from './config/env';
import registerSchedules from './config/scheduler';
import { connection } from './config/redis';
import { shutdownWorkers } from './workers';

const PORT = env.PORT;

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Register repeatable BullMQ schedules
    await registerSchedules();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = new SocketServer(server, {
      cors: {
        origin: env.FRONTEND_URL.split(','),
        credentials: true,
        methods: ['GET', 'POST'],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    initializeSocket(io);

    // Make io accessible from routes if needed
    app.set('io', io);

    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 ZeroWaste OS Backend running on port ${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🔌 Socket.io ready`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting requests
      server.close(() => {
        logger.info('HTTP server closed');
      });

      try {
        // Disconnect DB
        await mongoose.connection.close();
        logger.info('Mongoose database connection closed');

        // Disconnect Redis Client
        await connection.quit();
        logger.info('Redis connection closed');

        // Stop workers
        await shutdownWorkers();

        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled errors
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
