import { Router } from 'express';
import * as volunteerController from '../controllers/volunteerController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/tasks', volunteerController.getAvailableTasks);
router.get('/my-tasks', authorize(UserRole.Volunteer), volunteerController.getMyTasks);
router.get('/stats', authorize(UserRole.Volunteer), volunteerController.getVolunteerStats);
router.post('/tasks', authorize(UserRole.FoodBusinessOwner, UserRole.NGOPartner, UserRole.Admin), volunteerController.createTask);
router.post('/tasks/:id/accept', authorize(UserRole.Volunteer), volunteerController.acceptTask);
router.post('/tasks/:id/start', authorize(UserRole.Volunteer), volunteerController.startTask);
router.post('/tasks/:id/complete', authorize(UserRole.Volunteer), volunteerController.completeTask);
router.post('/tasks/:id/cancel', authorize(UserRole.Volunteer), volunteerController.cancelTask);

export default router;
