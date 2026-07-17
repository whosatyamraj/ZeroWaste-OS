import { Router } from 'express';
import * as foodController from '../controllers/foodController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { uploadImages } from '../middleware/upload';
import { UserRole } from '../types';

const router = Router();

router.get('/', foodController.getFoodItems);
router.get('/:id', foodController.getFoodItemById);

// Protected routes
router.use(authenticate);
router.get('/user/listings', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), foodController.getMyListings);
router.post('/', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), uploadImages, foodController.createFoodItem);
router.put('/:id', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), foodController.updateFoodItem);
router.delete('/:id', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), foodController.deleteFoodItem);

export default router;
