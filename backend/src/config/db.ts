import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';
import { tenantPlugin } from '../models/plugins/tenantPlugin';

// Apply tenant plugin globally to all schemas
mongoose.plugin(tenantPlugin);

const connectDB = async (): Promise<void> => {
  const mongoUri = env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
