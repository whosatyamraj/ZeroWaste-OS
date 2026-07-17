import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', marketplaceController.browseMarketplace);

// Protected routes
router.use(authenticate);
router.post('/orders', marketplaceController.createOrder);
router.get('/orders', marketplaceController.getMyOrders);
router.get('/orders/:id', marketplaceController.getOrderById);
router.patch('/orders/:id/status', marketplaceController.updateOrderStatus);
router.post('/orders/:id/cancel', marketplaceController.cancelOrder);

export default router;
