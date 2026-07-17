import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import marketplaceService from '../services/marketplaceService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const browseMarketplace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await marketplaceService.browseListings(req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await marketplaceService.createOrder(req.user!.userId, req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await marketplaceService.getUserOrders(req.user!.userId, req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: orders,
  });
});

export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await marketplaceService.getOrderById(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: order,
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await marketplaceService.updateOrderStatus(
    req.user!.userId,
    req.params.id,
    req.body.status
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Order status updated',
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await marketplaceService.cancelOrder(
    req.user!.userId,
    req.params.id,
    req.body.reason
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Order cancelled',
    data: order,
  });
});
