import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { ApiError } from '../utils/apiError';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          'You do not have permission to perform this action'
        )
      );
      return;
    }

    next();
  };
};

export const isOwnerOrAdmin = (
  getResourceOwnerId: (req: AuthenticatedRequest) => string | undefined
) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (req.user.role === UserRole.Admin) {
      return next();
    }

    const ownerId = getResourceOwnerId(req);

    if (!ownerId || ownerId !== req.user.userId) {
      next(
        ApiError.forbidden(
          'You do not have permission to access this resource'
        )
      );
      return;
    }

    next();
  };
};
