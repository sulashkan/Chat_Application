import { Router } from "express";
import passport from "../config/passport";
import { register, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const  FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
    const { token, user } = req.user;

    const userPayload = encodeURIComponent(Buffer.from(JSON.stringify(user)).toString("base64"));
    const callbackUrl = `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&user=${userPayload}`;

    res.redirect(callbackUrl);
  }
);

export default router;