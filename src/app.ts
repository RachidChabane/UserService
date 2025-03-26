import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { environment } from './config/environment';
import { errorHandler } from './middleware/error.middleware';
import userRoutes from './routes/user.routes';
import logger from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(environment.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: environment.nodeEnv });
});

// Apply error handling middleware (must be last)
app.use(errorHandler);

export default app;
