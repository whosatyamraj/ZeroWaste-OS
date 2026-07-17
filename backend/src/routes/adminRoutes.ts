import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.Admin));

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/reactivate', adminController.reactivateUser);
router.post('/users/:id/verify-ngo', adminController.verifyNGO);
router.delete('/users/:id', adminController.deleteUser);
router.get('/reports', adminController.getReports);

export default router;
