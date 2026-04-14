import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const isGoogleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (isGoogleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        const email = profile.emails[0].value;

        // 1. find user in DB
        let user = await User.findOne({ email });

        // 2. if not exists, create
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            provider: "google",
          });
        }
        
        const token = jwt.sign(
          {
            id: user._id,         
            email: user.email,
            name: user.name,
          },
          process.env.JWT_SECRET || "secret"
        );
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
