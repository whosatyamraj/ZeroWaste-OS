import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import analyticsService from '../services/analyticsService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const getSustainabilityMetrics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const metrics = await analyticsService.getSustainabilityMetrics(
    req.user!.userId,
    req.user!.role
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: metrics,
  });
});

export const getWasteTrends = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const period = (req.query.period as 'week' | 'month' | 'year') || 'month';
  const trends = await analyticsService.getWasteTrends(req.user!.userId, req.user!.role, period);

  res.status(StatusCodes.OK).json({
    success: true,
    data: trends,
  });
});

export const getPlatformAnalytics = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const analytics = await analyticsService.getPlatformAnalytics();

  res.status(StatusCodes.OK).json({
    success: true,
    data: analytics,
  });
});

export const getBusinessDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const dashboard = await analyticsService.getBusinessDashboard(req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: dashboard,
  });
});
