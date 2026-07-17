import { Router } from 'express';
import * as donationController from '../controllers/donationController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', donationController.getAvailableDonations);
router.get('/my', donationController.getMyDonations);
router.get('/:id', donationController.getDonationById);
router.post('/', authorize(UserRole.FoodBusinessOwner, UserRole.Admin), donationController.createDonation);
router.post('/:id/accept', authorize(UserRole.NGOPartner), donationController.acceptDonation);
router.post('/:id/schedule-pickup', authorize(UserRole.NGOPartner), donationController.schedulePickup);
router.patch('/:id/status', donationController.updateDonationStatus);

export default router;
