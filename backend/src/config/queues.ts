import { Queue } from 'bullmq';
import { connection } from './redis';

export const notificationQueue = new Queue('NotificationQueue', { connection: connection as any });
export const aiQueue = new Queue('AIQueue', { connection: connection as any });
export const analyticsQueue = new Queue('AnalyticsQueue', { connection: connection as any });
