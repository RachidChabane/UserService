import { Request, Response, NextFunction } from 'express';
import { expressjwt as jwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { environment } from '../config/environment';
import { userService } from '../services/user.service';
import logger from '../utils/logger';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Define interface to extend Express Request
declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        [key: string]: any;
      };
      user?: {
        id: string;
        auth0Id: string;
        email: string;
        displayName?: string;
        role: string;
      };
    }
  }
}

export const validateJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${environment.auth0.domain}/.well-known/jwks.json`
  }) as GetVerificationKey,
  audience: environment.auth0.audience,
  issuer: `https://${environment.auth0.domain}/`,
  algorithms: ['RS256']
});

export const syncUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.sub) {
      return next(new UnauthorizedError('No authenticated user found'));
    }

    const auth0Id = req.auth.sub;
    
    if (auth0Id.includes('@clients')) {
      const email = 'api-service@yourcompany.com'; 
      const name = 'API Service';
      
      const user = await userService.findOrCreateUser({
        auth0Id,
        email,  
        displayName: name
      });
      // @ts-ignore
      req.user = user;
      return next();
    }
    
    const email = req.auth.email || '';
    const name = req.auth[`${environment.auth0.audience}/name`] || req.auth.name || '';

    const user = await userService.findOrCreateUser({
      auth0Id,
      email,
      displayName: name
    });

    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    logger.error('Error syncing user data', { error });
    next(error);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};