import { Worker, Job } from 'bullmq';
import { connection } from '../config/redis';
import logger from '../utils/logger';
import foodService from '../services/foodService';
import pricingService from '../services/pricingService';

// Utility for structured logging
const logJob = (queue: string, job: Job, msg: string, level: 'info' | 'error' | 'warn' = 'info') => {
  logger[level]({
    queue,
    job: job.name,
    id: job.id,
    message: msg
  });
};

// 1. Notification Queue Worker
export const notificationWorker = new Worker(
  'NotificationQueue',
  async (job: Job) => {
    logJob('NotificationQueue', job, 'Processing notification job');
    // Will be fully implemented in Phase 2.10
  },
  // @ts-expect-error Known BullMQ/IORedis type conflict
  { connection }
);

// 2. AI Queue Worker
export const aiWorker = new Worker(
  'AIQueue',
  async (job: Job) => {
    logJob('AIQueue', job, 'Processing AI job');
    // Will be fully implemented in Phase 2.12
  },
  // @ts-expect-error Known BullMQ/IORedis type conflict
  { connection }
);

// 3. Analytics Queue Worker
export const analyticsWorker = new Worker(
  'AnalyticsQueue',
  async (job: Job) => {
    logJob('AnalyticsQueue', job, 'Processing analytics job');
    // To be implemented
  },
  // @ts-expect-error Known BullMQ/IORedis type conflict
  { connection }
);

// 4. Email Queue Worker
export const emailWorker = new Worker(
  'EmailQueue',
  async (job: Job) => {
    logJob('EmailQueue', job, 'Processing email job');
    // To be implemented
  },
  // @ts-expect-error Known BullMQ/IORedis type conflict
  { connection }
);

// 5. Cleanup Queue Worker
export const cleanupWorker = new Worker(
  'CleanupQueue',
  async (job: Job) => {
    logJob('CleanupQueue', job, 'Processing cleanup job');
    // To be implemented
  },
  // @ts-expect-error Known BullMQ/IORedis type conflict
  { connection }
);

// 6. System Cron Worker (Formerly Scheduler Worker)
export const systemCronWorker = new Worker(
  'system-cron',
  async (job: Job) => {
    logJob('system-cron', job, 'Running repeatable cron job');
    switch (job.name) {
      case 'check-expiring-food':
        logJob('system-cron', job, 'Running expired food check...');
        await foodService.checkExpiredFoods();
        break;
      case 'update-dynamic-pricing':
        logJob('system-cron', job, 'Updating dynamic price decays...');
        await pricingService.updateDecay();
        break;
      case 'generate-daily-analytics':
        logJob('system-cron', job, 'Compiling daily FBO aggregates...');
        // await analyticsService.generateDailyReport(); // Analytics not yet fully detailed for cron
        break;
      case 'run-ai-forecasting':
        logJob('system-cron', job, 'Triggering AI Prophet/XGBoost predictions...');
        // await aiForecastService.predictDemand(); // AI integration to be wired in next phase
        break;
      default:
        logJob('system-cron', job, 'Unknown cron job type', 'warn');
    }
  },
  // @ts-expect-error Known BullMQ/IORedis type conflict
  { connection }
);

// Log worker statuses
const workers = [
  notificationWorker,
  aiWorker,
  analyticsWorker,
  emailWorker,
  cleanupWorker,
  systemCronWorker
];

workers.forEach(worker => {
  worker.on('completed', (job) => {
    if (job) logJob(worker.name, job, 'Job completed successfully');
  });
  worker.on('failed', (job, err) => {
    if (job) logJob(worker.name, job, `Job failed: ${err.message}`, 'error');
  });
});

// Graceful shutdown
export const shutdownWorkers = async () => {
  logger.info(`Closing workers gracefully...`);
  await Promise.all(workers.map(w => w.close()));
  logger.info('All workers closed.');
};

logger.info('⚙️ BullMQ background workers initialized');
