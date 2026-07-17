import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import foodService from '../services/foodService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const createFoodItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const images = req.files ? (req.files as Express.Multer.File[]).map(f => f.path) : [];
  const foodItem = await foodService.createFoodItem(req.user!.userId, { ...req.body, images });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Food item listed successfully',
    data: foodItem,
  });
});

export const getFoodItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await foodService.getFoodItems(req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

export const getFoodItemById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await foodService.getFoodItemById(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: item,
  });
});

export const updateFoodItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await foodService.updateFoodItem(req.user!.userId, req.params.id, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Food item updated',
    data: item,
  });
});

export const deleteFoodItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await foodService.deleteFoodItem(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Food item deleted',
  });
});

export const getMyListings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await foodService.getUserListings(req.user!.userId, req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});
