import dotenv from 'dotenv';
import { z } from 'zod';
import logger from '../utils/logger';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI is required for database connection',
  }),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  JWT_ACCESS_SECRET: z.string({
    required_error: 'JWT_ACCESS_SECRET is required for security signatures',
  }).min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string({
    required_error: 'JWT_REFRESH_SECRET is required for security signatures',
  }).min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('❌ Invalid environment configuration:');
    error.errors.forEach((err) => {
      logger.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    logger.error('❌ Failed to parse environment config', error);
  }
  process.exit(1);
}

export default config;
