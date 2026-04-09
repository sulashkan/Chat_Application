import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

const isGoogleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (isGoogleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/api/auth/google/callback",
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        const user = {
          email: profile.emails[0].value,
          name: profile.displayName,
        };

        const token = jwt.sign(user, process.env.JWT_SECRET || "secret");
        return done(null, { user, token });
      }
    )
  );
} else {
  console.warn(
    "Google OAuth is disabled because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing."
  );
}

export { isGoogleAuthConfigured };
export default passport;
