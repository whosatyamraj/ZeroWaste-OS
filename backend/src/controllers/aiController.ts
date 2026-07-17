import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import aiProxyService from '../services/aiProxyService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const getDemandForecast = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await aiProxyService.getDemandForecast({
    business_id: req.user!.userId,
    ...req.body,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

export const analyzeFoodSafety = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await aiProxyService.analyzeFoodSafety(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

export const getDecisionRecommendation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await aiProxyService.getDecisionRecommendation(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

export const getInsights = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await aiProxyService.getInsights({
    business_id: req.user!.userId,
    ...req.body,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

export const getInventoryPredictions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await aiProxyService.getInventoryPredictions(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});
