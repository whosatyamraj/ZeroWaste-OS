import { Router } from 'express';
import authRoutes from './authRoutes';
import foodRoutes from './foodRoutes';
import marketplaceRoutes from './marketplaceRoutes';
import donationRoutes from './donationRoutes';
import volunteerRoutes from './volunteerRoutes';
import inventoryRoutes from './inventoryRoutes';
import analyticsRoutes from './analyticsRoutes';
import adminRoutes from './adminRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/food-items', foodRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/donations', donationRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

import mongoose from 'mongoose';
import redisClient from '../config/redis';
import axios from 'axios';
import env from '../config/env';

// Liveness check - ensures the server is running
router.get('/health/liveness', (_req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness check - ensures the server is ready to accept traffic
router.get('/health/readiness', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  
  let redisStatus = 'down';
  try {
    const ping = await redisClient.ping();
    if (ping === 'PONG') {
      redisStatus = 'up';
    }
  } catch {
    redisStatus = 'down';
  }
  
  let aiStatus = 'down';
  try {
    const aiResponse = await axios.get(`${env.AI_SERVICE_URL}/health`, { timeout: 2000 });
    if (aiResponse.status === 200) {
      aiStatus = 'up';
    }
  } catch {
    aiStatus = 'down';
  }
  
  const status = (dbStatus === 'up' && redisStatus === 'up' && aiStatus === 'up') ? 'ready' : 'not_ready';
  
  res.status(status === 'ready' ? 200 : 503).json({
    success: status === 'ready',
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: dbStatus,
      cache: redisStatus,
      aiService: aiStatus,
    }
  });
});

// Backward compatibility
router.get('/health', (req, res) => {
  res.redirect('/api/v1/health/readiness');
});

export default router;
