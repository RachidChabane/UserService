import { FilterQuery } from 'mongoose';
import User, { IUser, CreateUserDto, UpdateUserDto, UserFilters, PaginatedUsers } from '../models/user.model';
import { NotFoundError } from '../utils/errors';

class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      return null;
    }
  }

  async findByAuth0Id(auth0Id: string): Promise<IUser | null> {
    return User.findOne({ auth0Id });
  }

  async create(userData: CreateUserDto): Promise<IUser> {
    const newUser = new User({
      auth0Id: userData.auth0Id,
      email: userData.email,
      displayName: userData.displayName || null,
      role: userData.role || 'user'
    });
    
    return await newUser.save();
  }

  async update(id: string, userData: UpdateUserDto): Promise<IUser> {
    const updateData: Partial<IUser> = {};
    
    if (userData.displayName !== undefined) {
      updateData.displayName = userData.displayName;
    }
    
    if (userData.email !== undefined) {
      updateData.email = userData.email;
    }
    
    // If no fields to update, return current user
    if (Object.keys(updateData).length === 0) {
      const currentUser = await this.findById(id);
      if (!currentUser) {
        throw new NotFoundError('User not found');
      }
      return currentUser;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    
    return updatedUser;
  }

  async updateAuth0UserInfo(auth0Id: string, userData: UpdateUserDto): Promise<IUser> {
    const user = await this.findByAuth0Id(auth0Id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return this.update(user.id, userData);
  }

  async findAll(filters: UserFilters): Promise<PaginatedUsers> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query: FilterQuery<IUser> = {};
    
    if (filters.search) {
      query.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { displayName: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    const total = await User.countDocuments(query);
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export const userRepository = new UserRepository();