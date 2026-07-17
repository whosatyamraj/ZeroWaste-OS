import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import donationService from '../services/donationService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const createDonation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const donation = await donationService.createDonation(req.user!.userId, req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Donation listed successfully',
    data: donation,
  });
});

export const getAvailableDonations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await donationService.getAvailableDonations(req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.donations,
    pagination: result.pagination,
  });
});

export const acceptDonation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const donation = await donationService.acceptDonation(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Donation accepted',
    data: donation,
  });
});

export const schedulePickup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const donation = await donationService.schedulePickup(
    req.user!.userId,
    req.params.id,
    req.body.scheduledPickup
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Pickup scheduled',
    data: donation,
  });
});

export const updateDonationStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const donation = await donationService.updateDonationStatus(
    req.user!.userId,
    req.params.id,
    req.body.status
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Donation status updated',
    data: donation,
  });
});

export const getMyDonations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const donations = await donationService.getUserDonations(req.user!.userId, req.user!.role);

  res.status(StatusCodes.OK).json({
    success: true,
    data: donations,
  });
});

export const getDonationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const donation = await donationService.getDonationById(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: donation,
  });
});
