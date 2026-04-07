import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { getChats, getOrCreatePrivateChat } from "../controllers/chat.controller";

const router = Router();

router.get("/", authMiddleware, getChats);
router.post("/private", authMiddleware, getOrCreatePrivateChat);

export default router;
