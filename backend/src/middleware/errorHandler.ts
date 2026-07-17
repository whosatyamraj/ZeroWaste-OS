import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';

const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log full error details server-side
  logger.error('Error caught by handler:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Handle known operational errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const mongooseErr = err as unknown as Record<string, unknown>;
    const errors = mongooseErr.errors
      ? Object.values(mongooseErr.errors as Record<string, { message: string }>).map(
          (e) => e.message
        )
      : [];
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource identifier',
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if ((err as unknown as Record<string, unknown>).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A resource with that identifier already exists',
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
    return;
  }

  // Generic error - never expose internals to client
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
};

export default errorHandler;
