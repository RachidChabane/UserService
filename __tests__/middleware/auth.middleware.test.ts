import { Request, Response } from 'express';
import { syncUserMiddleware, requireAdmin } from '../../src/middleware/auth.middleware';
import { userService } from '../../src/services/user.service';
import { UnauthorizedError, ForbiddenError } from '../../src/utils/errors';

jest.mock('../../src/services/user.service');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('syncUserMiddleware', () => {
    it('should throw UnauthorizedError if no auth subject is provided', async () => {
      mockRequest.auth = undefined;

      await syncUserMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('No authenticated user found');
    });

    it('should handle API service client authentication', async () => {
      const mockAuth0Id = 'auth0|client123@clients';
      const mockUser = {
        id: 'user123',
        auth0Id: mockAuth0Id,
        email: 'api-service@yourcompany.com',
        displayName: 'API Service',
        role: 'admin'
      };
      
      mockRequest.auth = { sub: mockAuth0Id };
      
      (userService.findOrCreateUser as jest.Mock).mockResolvedValue(mockUser);

      await syncUserMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.findOrCreateUser).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: 'api-service@yourcompany.com',
        displayName: 'API Service'
      });
      
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined(); // No error passed
    });

    it('should sync regular user data from Auth0', async () => {
      const mockAuth0Id = 'auth0|user123';
      const mockEmail = 'user@example.com';
      const mockName = 'Test User';
      const mockUser = {
        id: 'user123',
        auth0Id: mockAuth0Id,
        email: mockEmail,
        displayName: mockName,
        role: 'user'
      };
      
      mockRequest.auth = { 
        sub: mockAuth0Id,
        email: mockEmail,
        name: mockName
      };
      
      (userService.findOrCreateUser as jest.Mock).mockResolvedValue(mockUser);

      await syncUserMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.findOrCreateUser).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: mockEmail,
        displayName: mockName
      });
      
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined(); // No error passed
    });

    it('should handle errors and pass them to next middleware', async () => {
      const mockAuth0Id = 'auth0|user123';
      const error = new Error('Service error');
      
      mockRequest.auth = { sub: mockAuth0Id };
      
      (userService.findOrCreateUser as jest.Mock).mockRejectedValue(error);

      await syncUserMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('requireAdmin', () => {
    it('should call next if user has admin role', () => {
      mockRequest.user = {
        id: 'user123',
        auth0Id: 'auth0|user123',
        email: 'admin@example.com',
        role: 'admin'
      };

      requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined(); // No error passed
    });

    it('should throw ForbiddenError if user does not have admin role', () => {
      mockRequest.user = {
        id: 'user123',
        auth0Id: 'auth0|user123',
        email: 'user@example.com',
        role: 'user'
      };

      requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toBe('Admin access required');
    });
  });
});