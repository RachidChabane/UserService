import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { UpdateUserDto, UserFilters } from '../models/user.model';
import logger from '../utils/logger';

interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
  }
}

export class UserController {
  // Get current user profile
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Not authenticated' 
        });
      }
      
      const user = await userService.findById(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get user by ID (admin only)
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Update current user profile
  async updateCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Not authenticated' 
        });
      }
      
      const updateData: UpdateUserDto = {
        displayName: req.body.displayName
      };
      
      const updatedUser = await userService.updateProfile(req.user.id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
  
  // List all users (admin only)
  async listUsers(req: PaginatedRequest, res: Response, next: NextFunction) {
    try {
      const filters: UserFilters = {
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        search: req.query.search
      };
      
      const paginatedUsers = await userService.findAllUsers(filters);
      
      res.status(200).json({
        status: 'success',
        data: paginatedUsers.users,
        pagination: {
          total: paginatedUsers.total,
          page: paginatedUsers.page,
          limit: paginatedUsers.limit,
          totalPages: paginatedUsers.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();