import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, ITokenPayload } from '../types';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';
import { tenantStorage } from './tenantContext';

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      logger.error('JWT_ACCESS_SECRET is not configured');
      throw ApiError.internal();
    }

    const decoded = jwt.verify(token, secret) as ITokenPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };

    if (decoded.tenantId) {
      tenantStorage.run({ tenantId: decoded.tenantId }, () => {
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized('Access token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid access token'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      return next();
    }

    const decoded = jwt.verify(token, secret) as ITokenPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };

    if (decoded.tenantId) {
      tenantStorage.run({ tenantId: decoded.tenantId }, () => {
        next();
      });
    } else {
      next();
    }
  } catch {
    next();
  }
};
