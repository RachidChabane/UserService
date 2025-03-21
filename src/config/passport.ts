// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

if (!googleClientId || !googleClientSecret) {
  console.error("Missing Google OAuth credentials in environment variables");
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.emails![0].value },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              provider: "GOOGLE",
              provider_id: profile.id,
              email: profile.emails![0].value,
              display_name: profile.displayName,
              role: "USER",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);