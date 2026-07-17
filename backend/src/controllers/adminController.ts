import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import adminService from '../services/adminService';
import { asyncHandler } from '../utils/asyncHandler';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getUsers(req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getUserById(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User role updated',
    data: user,
  });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.suspendUser(req.params.id, req.body.reason);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User suspended',
    data: user,
  });
});

export const reactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.reactivateUser(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User reactivated',
    data: user,
  });
});

export const verifyNGO = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.verifyNGO(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'NGO verified',
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.deleteUser(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: result.message,
  });
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getReports(req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.reports,
    pagination: result.pagination,
  });
});
