
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_concert_tickets';
process.env.AUTH0_DOMAIN = 'just-ticket.eu.auth0.com';
process.env.AUTH0_AUDIENCE = 'https://api.concert-tickets.com';
process.env.LOG_LEVEL = 'error'; 

// Silence Winston logs during tests
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));