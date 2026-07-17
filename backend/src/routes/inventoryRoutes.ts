import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.FoodBusinessOwner, UserRole.Admin));

router.get('/', inventoryController.getInventory);
router.post('/', inventoryController.addInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);
router.post('/:id/waste', inventoryController.logWaste);
router.post('/:id/restock', inventoryController.restockItem);
router.get('/alerts/expiring', inventoryController.getExpiringItems);
router.get('/alerts/low-stock', inventoryController.getLowStockItems);
router.get('/analytics/waste', inventoryController.getWasteAnalytics);

export default router;
