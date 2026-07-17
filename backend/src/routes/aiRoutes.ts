import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { aiProxyLimiter as aiLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

router.post('/demand-forecast', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), aiController.getDemandForecast);
router.post('/food-safety', aiController.analyzeFoodSafety);
router.post('/decide-action', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), aiController.getDecisionRecommendation);
router.post('/insights', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), aiController.getInsights);
router.post('/inventory-predict', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), aiController.getInventoryPredictions);

export default router;
