export interface Environment {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  auth0: {
    domain: string;
    audience: string;
  };
  logLevel: string;
}

export const environment: Environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/concert_tickets',
  auth0: {
    domain: process.env.AUTH0_DOMAIN || 'your-tenant.auth0.com',
    audience: process.env.AUTH0_AUDIENCE || 'https://api.concert-tickets.com'
  },
  logLevel: process.env.LOG_LEVEL || 'info'
};