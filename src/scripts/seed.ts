import 'dotenv/config';
import mongoose from 'mongoose';
import { environment } from '../config/environment';
import User from '../models/user.model';
import logger from '../utils/logger';

async function seed() {
  try {

    await mongoose.connect(environment.mongodbUri);
    logger.info('Connected to MongoDB for seeding');

    const count = await User.countDocuments();
    if (count > 0) {
      logger.info(`Database already has ${count} users. Skipping seed.`);
      return;
    }


    const admin = new User({
      auth0Id: 'auth0|admin',
      email: 'admin@example.com',
      displayName: 'System Admin',
      role: 'admin'
    });
    await admin.save();

    const testUsers = [
      {
        auth0Id: 'auth0|test1',
        email: 'user1@example.com',
        displayName: 'Test User 1',
        role: 'user'
      },
      {
        auth0Id: 'auth0|test2',
        email: 'user2@example.com',
        displayName: 'Test User 2',
        role: 'user'
      }
    ];

    await User.insertMany(testUsers);
    
    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      logger.info('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}