import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export interface ITenantContext {
  tenantId: string;
}

export const tenantStorage = new AsyncLocalStorage<ITenantContext>();

export const tenantContextMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let tenantId = req.user?.tenantId;

  // Optional: Allow passing tenant ID via header for super admins overriding tenant context
  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId && typeof headerTenantId === 'string' && req.user?.role === 'Admin') {
    tenantId = headerTenantId;
  }

  if (tenantId) {
    tenantStorage.run({ tenantId }, () => {
      next();
    });
  } else {
    // If no tenant context is available (e.g. public routes or users without tenant),
    // proceed without context. The Mongoose plugin won't apply filters.
    next();
  }
};
