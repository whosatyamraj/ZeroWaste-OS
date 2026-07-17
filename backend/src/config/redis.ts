import Redis from 'ioredis';
import env from './env';
import logger from '../utils/logger';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Critical configuration for BullMQ
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
};

export const connection: Redis = new Redis(redisConfig);

connection.on('connect', () => {
  logger.info(`🔌 Redis connected to ${env.REDIS_HOST}:${env.REDIS_PORT}`);
});

connection.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

export default connection;
