import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { userService } from '../../src/services/user.service';
import User from '../../src/models/user.model';
import { NotFoundError } from '../../src/utils/errors';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Service', () => {
  describe('findOrCreateUser', () => {
    it('should create a new user when the user does not exist', async () => {
      const userData = {
        auth0Id: 'auth0|test123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const user = await userService.findOrCreateUser(userData);

      expect(user).toBeDefined();
      expect(user.auth0Id).toBe(userData.auth0Id);
      expect(user.email).toBe(userData.email);
      expect(user.displayName).toBe(userData.displayName);
      expect(user.role).toBe('user'); 
    });

    it('should return existing user when auth0Id already exists', async () => {
      const userData = {
        auth0Id: 'auth0|test123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      await userService.findOrCreateUser(userData);

      const user = await userService.findOrCreateUser(userData);

      expect(user).toBeDefined();
      expect(user.auth0Id).toBe(userData.auth0Id);

      const count = await User.countDocuments();
      expect(count).toBe(1);
    });

    it('should update user data if email or displayName has changed', async () => {

      const initialData = {
        auth0Id: 'auth0|test123',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      await userService.findOrCreateUser(initialData);

      const updatedData = {
        auth0Id: 'auth0|test123',
        email: 'updated@example.com',
        displayName: 'Updated User'
      };
      const user = await userService.findOrCreateUser(updatedData);

      expect(user.email).toBe(updatedData.email);
      expect(user.displayName).toBe(updatedData.displayName);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userData = {
        auth0Id: 'auth0|test123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const createdUser = await userService.findOrCreateUser(userData);
      const foundUser = await userService.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      await expect(userService.findById(nonExistentId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProfile', () => {
    it('should update user display name', async () => {
      const userData = {
        auth0Id: 'auth0|test123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const createdUser = await userService.findOrCreateUser(userData);
      
      const updatedUser = await userService.updateProfile(createdUser.id, {
        displayName: 'Updated Name'
      });

      expect(updatedUser.displayName).toBe('Updated Name');
      expect(updatedUser.email).toBe(userData.email); 
    });

    it('should throw NotFoundError when updating non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      await expect(userService.updateProfile(nonExistentId, {
        displayName: 'Updated Name'
      })).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAllUsers', () => {
    beforeEach(async () => {
      const users = [
        {
          auth0Id: 'auth0|test1',
          email: 'test1@example.com',
          displayName: 'Test User 1'
        },
        {
          auth0Id: 'auth0|test2',
          email: 'test2@example.com',
          displayName: 'Test User 2'
        },
        {
          auth0Id: 'auth0|test3',
          email: 'test3@example.com',
          displayName: 'Test User 3'
        }
      ];

      for (const user of users) {
        await userService.findOrCreateUser(user);
      }
    });

    it('should return paginated users', async () => {
      const result = await userService.findAllUsers({ page: 1, limit: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should filter users by search term', async () => {
      const result = await userService.findAllUsers({ 
        search: 'test2' 
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('test2@example.com');
    });
  });
});