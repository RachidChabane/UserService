import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config';
import prisma from '../client';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId || '',
      clientSecret: config.oauth.google.clientSecret || '',
      callbackURL: config.oauth.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Rechercher l'utilisateur dans la base de données par son ID Google
        let user = await prisma.user.findUnique({
          where: { provider_id: profile.id },
        });

        // Si l'utilisateur n'existe pas, le créer
        if (!user) {
          user = await prisma.user.create({
            data: {
              provider: 'google',
              provider_id: profile.id,
              email: profile.emails ? profile.emails[0].value : '',
              display_name: profile.displayName,
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});