import { Router } from "express";
import passport from "../config/passport";
import { isGoogleAuthConfigured } from "../config/passport";
import { register, login } from "../controllers/auth.controller";

const router = Router();

const getFrontendUrl = (): string => {
  return process.env.FRONTEND_URL || "http://localhost:3000";
};

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  (req, res, next) => {
    if (!isGoogleAuthConfigured) {
      res.status(503).json({ message: "Google OAuth is not configured on the server." });
      return;
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleAuthConfigured) {
      res.redirect(`${getFrontendUrl()}/login?error=google_oauth_not_configured`);
      return;
    }
    next();
  },
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const { token, user } = req.user;

    const userPayload = encodeURIComponent(Buffer.from(JSON.stringify(user)).toString("base64"));
    const callbackUrl = `${getFrontendUrl()}/auth/callback?token=${encodeURIComponent(token)}&user=${userPayload}`;

    res.redirect(callbackUrl);
  }
);

export default router;
