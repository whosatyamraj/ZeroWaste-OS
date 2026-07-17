import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import inventoryService from '../services/inventoryService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const getInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await inventoryService.getInventory(req.user!.userId, req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

export const addInventoryItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await inventoryService.addInventoryItem(req.user!.userId, req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Inventory item added',
    data: item,
  });
});

export const updateInventoryItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await inventoryService.updateInventoryItem(req.user!.userId, req.params.id, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Inventory updated',
    data: item,
  });
});

export const deleteInventoryItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await inventoryService.deleteInventoryItem(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Inventory item removed',
  });
});

export const logWaste = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await inventoryService.logWaste(
    req.user!.userId,
    req.params.id,
    req.body.quantity,
    req.body.reason
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Waste logged',
    data: item,
  });
});

export const getExpiringItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 3;
  const items = await inventoryService.getExpiringItems(req.user!.userId, days);

  res.status(StatusCodes.OK).json({
    success: true,
    data: items,
  });
});

export const getLowStockItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const items = await inventoryService.getLowStockItems(req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: items,
  });
});

export const restockItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await inventoryService.restockItem(
    req.user!.userId,
    req.params.id,
    req.body.quantity
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Item restocked',
    data: item,
  });
});

export const getWasteAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
  const data = await inventoryService.getWasteAnalytics(req.user!.userId, startDate, endDate);

  res.status(StatusCodes.OK).json({
    success: true,
    data,
  });
});
