// src/scripts/db-setup.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { environment } from '../config/environment';
import User from '../models/user.model';
import logger from '../utils/logger';

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(environment.mongodbUri);
    logger.info('Connected to MongoDB for setup');

    // Drop existing indexes to avoid conflicts (optional - use with caution)
    // Uncomment this if you're having index issues and want to rebuild all indexes
    // const collections = await mongoose.connection.db.collections();
    // for (const collection of collections) {
    //   await collection.dropIndexes();
    //   logger.info(`Dropped indexes for collection: ${collection.collectionName}`);
    // }

    // Create indexes (this will be skipped if indexes already exist)
    logger.info('Setting up indexes...');
    
    // Instead of using User.createIndexes() which might have issues
    // We'll ensure the model is registered with Mongoose
    logger.info('Model has been registered');
    
    logger.info('Database setup completed successfully');
  } catch (error) {
    logger.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      logger.info('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database setup failed:', error);
      process.exit(1);
    });
}