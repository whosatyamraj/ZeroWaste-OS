import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: { user, accessToken: tokens.accessToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Login successful',
    data: { user, accessToken: tokens.accessToken },
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'No refresh token provided',
    });
    return;
  }

  const tokens = await authService.refreshToken(token);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Token refreshed',
    data: { accessToken: tokens.accessToken },
  });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (req.user) {
    await authService.logout(req.user.userId, refreshToken);
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email verified successfully',
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token, req.body.password);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await authService.changePassword(
    req.user!.userId,
    req.body.currentPassword,
    req.body.newPassword
  );

  res.clearCookie('refreshToken', { path: '/api/auth' });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password changed. Please login again.',
  });
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.updateProfile(req.user!.userId, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile updated',
    data: user,
  });
});

export const googleOAuthPlaceholder = asyncHandler(async (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: false,
    message: 'Google OAuth integration coming soon. Please use email/password authentication.',
  });
});
