import 'dotenv/config';
import app from './app';
import connectDB from './config/database';
import { environment } from './config/environment';
import logger from './utils/logger';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the Express server
    const server = app.listen(environment.port, () => {
      logger.info(`Server started on port ${environment.port} in ${environment.nodeEnv} mode`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();