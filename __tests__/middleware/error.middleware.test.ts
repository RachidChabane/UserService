// __tests__/middleware/error.middleware.test.ts
import { Request, Response } from 'express';
import { errorHandler } from '../../src/middleware/error.middleware';
import { AppError, NotFoundError, UnauthorizedError } from '../../src/utils/errors';

jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test-path',
      method: 'GET'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should handle UnauthorizedError from express-jwt', () => {
    const error = new Error('Invalid token');
    error.name = 'UnauthorizedError';

    errorHandler(
      error as any,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid token'
    });
  });

  it('should handle AppError with custom status code', () => {
    const error = new NotFoundError('User not found');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'User not found'
    });
  });

  it('should handle generic errors as 500 Internal Server Error', () => {
    const error = new Error('Database connection failed');

    errorHandler(
      error as any,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    });
  });
});