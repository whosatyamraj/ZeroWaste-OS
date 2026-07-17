import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/sustainability', analyticsController.getSustainabilityMetrics);
router.get('/waste-trends', analyticsController.getWasteTrends);
router.get('/dashboard', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), analyticsController.getBusinessDashboard);
router.get('/platform', authorize(UserRole.Admin), analyticsController.getPlatformAnalytics);

export default router;
