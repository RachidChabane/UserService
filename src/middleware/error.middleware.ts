// src/middleware/error.middleware.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle express-jwt errors
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
    return;
  }

  // Operational errors (expected errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  // Unexpected errors
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
  return;
};