import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import volunteerService from '../services/volunteerService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const getAvailableTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await volunteerService.getAvailableTasks(req.query as any);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination,
  });
});

export const getMyTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tasks = await volunteerService.getMyTasks(req.user!.userId, req.query.status as string);

  res.status(StatusCodes.OK).json({
    success: true,
    data: tasks,
  });
});

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await volunteerService.createTask(req.user!.userId, req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Task created',
    data: task,
  });
});

export const acceptTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await volunteerService.acceptTask(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Task accepted',
    data: task,
  });
});

export const startTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await volunteerService.startTask(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Task started',
    data: task,
  });
});

export const completeTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await volunteerService.completeTask(req.user!.userId, req.params.id, req.body.notes);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Task completed',
    data: task,
  });
});

export const cancelTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await volunteerService.cancelTask(req.user!.userId, req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Task released',
    data: task,
  });
});

export const getVolunteerStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await volunteerService.getVolunteerStats(req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: stats,
  });
});
