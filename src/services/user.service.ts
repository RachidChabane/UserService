import { IUser, CreateUserDto, UpdateUserDto, UserFilters, PaginatedUsers } from '../models/user.model';
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

class UserService {
  async findById(id: string): Promise<IUser> {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }
  
  async findByAuth0Id(auth0Id: string): Promise<IUser | null> {
    return userRepository.findByAuth0Id(auth0Id);
  }
  
  async findOrCreateUser(userData: CreateUserDto): Promise<IUser> {
    try {
      const existingUser = await this.findByAuth0Id(userData.auth0Id);
      
      if (existingUser) {
        if (existingUser.email !== userData.email || 
            existingUser.displayName !== userData.displayName) {
          
          return userRepository.update(existingUser.id, {
            email: userData.email,
            displayName: userData.displayName
          });
        }
        
        return existingUser;
      }
      
      const newUser = await userRepository.create(userData);
      logger.info(`Created new user: ${newUser.id} with Auth0 ID: ${userData.auth0Id}`);
      
      return newUser;
    } catch (error) {
      logger.error('Error finding or creating user', { error, auth0Id: userData.auth0Id });
      throw error;
    }
  }
  
  async updateProfile(id: string, updateData: UpdateUserDto): Promise<IUser> {
    return userRepository.update(id, updateData);
  }
  
  async findAllUsers(filters: UserFilters): Promise<PaginatedUsers> {
    return userRepository.findAll(filters);
  }
}

export const userService = new UserService();