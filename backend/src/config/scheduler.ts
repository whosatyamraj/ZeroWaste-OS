import { Queue } from 'bullmq';
import { connection } from './redis';
import logger from '../utils/logger';

// @ts-expect-error Known BullMQ/IORedis type conflict
const systemCronQueue = new Queue('system-cron', { connection });

export const registerSchedules = async (): Promise<void> => {
  try {
    // 1. Expired food check: Every 15 minutes
    await systemCronQueue.upsertJobScheduler('check-expiring-food-job', {
      pattern: '*/15 * * * *',
    }, {
      name: 'check-expiring-food',
    });

    // 2. Dynamic price update: Every hour
    await systemCronQueue.upsertJobScheduler('update-dynamic-pricing-job', {
      pattern: '0 * * * *',
    }, {
      name: 'update-dynamic-pricing',
    });

    // 3. Daily analytics: Every midnight
    await systemCronQueue.upsertJobScheduler('generate-daily-analytics-job', {
      pattern: '0 0 * * *',
    }, {
      name: 'generate-daily-analytics',
    });

    // 4. AI demand forecast: Every midnight
    await systemCronQueue.upsertJobScheduler('run-ai-forecasting-job', {
      pattern: '0 0 * * *',
    }, {
      name: 'run-ai-forecasting',
    });

    logger.info('⏰ BullMQ repeatable jobs scheduled successfully');
  } catch (error) {
    logger.error('❌ Failed to register repeatable scheduler jobs:', error);
  }
};

export default registerSchedules;
