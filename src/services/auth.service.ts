import httpStatus from 'http-status';
import tokenService from './token.service';
import userService from './user.service';
import ApiError from '../utils/ApiError';
import { Role, TokenType, User } from '@prisma/client';
import prisma from '../client';
import { encryptPassword, isPasswordMatch } from '../utils/encryption';
import { AuthTokensResponse } from '../types/response';
import exclude from '../utils/exclude';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
/**
 * Login with Google
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {Object} profile
 * @param {Function} done
 */
const loginUserWithGoogle = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: Function
) => {
  try {
    let user = await userService.getUserByEmail(profile.emails[0].value, [
      'id',
      'provider',
      'provider_id',
      'email',
      'display_name',
      'role',
      'createdAt',
      'updatedAt',
    ]);

    if (!user) {
      user = await userService.createUser(profile.emails[0].value,profile.displayName,Role.USER);
    }

    done(null, exclude(user, ['createdAt', 'updatedAt']));
  } catch (error) {
    done(error);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
    },
    loginUserWithGoogle
  )
);

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false
    }
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await prisma.token.delete({ where: { id: refreshTokenData.id } });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<AuthTokensResponse>}
 */
const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const { userId } = refreshTokenData;
    await prisma.token.delete({ where: { id: refreshTokenData.id } });
    return tokenService.generateAuthTokens({ id: userId });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export default {
  isPasswordMatch,
  encryptPassword,
  logout,
  refreshAuth,
  loginUserWithGoogle,
};
