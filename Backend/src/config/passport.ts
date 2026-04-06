import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      const user = {
        email: profile.emails[0].value,
        name: profile.displayName,
      };

      const token = jwt.sign(user, process.env.JWT_SECRET || "secret");
      return done(null, { user, token });
    }
  )
);

export default passport;