import { Request, Response } from 'express';
import { userController } from '../../src/controllers/user.controller';
import { userService } from '../../src/services/user.service';
import { NotFoundError } from '../../src/utils/errors';

// Mock userService
jest.mock('../../src/services/user.service');

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('getCurrentUser', () => {
    it('should return 401 if no user is authenticated', async () => {
      mockRequest.user = undefined;

      await userController.getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not authenticated'
      });
    });

    it('should return user data for authenticated user', async () => {
      const mockUser = {
        id: '123',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user'
      };

      mockRequest.user = { id: '123', auth0Id: 'auth0|123', email: 'test@example.com', role: 'user' };
      
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.findById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });

    it('should call next with error if service throws', async () => {
      mockRequest.user = { id: '123', auth0Id: 'auth0|123', email: 'test@example.com', role: 'user' };
      
      const error = new Error('Service error');
      (userService.findById as jest.Mock).mockRejectedValue(error);

      await userController.getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateCurrentUser', () => {
    it('should return 401 if no user is authenticated', async () => {
      mockRequest.user = undefined;

      await userController.updateCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not authenticated'
      });
    });

    it('should update user profile and return updated data', async () => {
      const mockUser = {
        id: '123',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        displayName: 'Updated Name',
        role: 'user'
      };

      mockRequest.user = { id: '123', auth0Id: 'auth0|123', email: 'test@example.com', role: 'user' };
      mockRequest.body = { displayName: 'Updated Name' };
      
      (userService.updateProfile as jest.Mock).mockResolvedValue(mockUser);

      await userController.updateCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.updateProfile).toHaveBeenCalledWith('123', { displayName: 'Updated Name' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });
  });

  describe('getUserById', () => {
    it('should return user data for requested ID', async () => {
      const mockUser = {
        id: '123',
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user'
      };

      mockRequest.params = { id: '123' };
      
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.findById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });

    it('should call next with error if service throws', async () => {
      mockRequest.params = { id: 'nonexistent' };
      
      const error = new NotFoundError('User not found');
      (userService.findById as jest.Mock).mockRejectedValue(error);

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' }
      ];

      const mockPaginatedResult = {
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockRequest.query = {};
      
      (userService.findAllUsers as jest.Mock).mockResolvedValue(mockPaginatedResult);

      await userController.listUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.findAllUsers).toHaveBeenCalledWith({ 
        page: 1, 
        limit: 10, 
        search: undefined 
      });
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUsers,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });

    it('should handle pagination and search parameters', async () => {
      const mockPaginatedResult = {
        users: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0
      };

      mockRequest.query = { page: '2', limit: '5', search: 'test' };
      
      (userService.findAllUsers as jest.Mock).mockResolvedValue(mockPaginatedResult);

      await userController.listUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.findAllUsers).toHaveBeenCalledWith({ 
        page: 2, 
        limit: 5, 
        search: 'test' 
      });
    });
  });
});