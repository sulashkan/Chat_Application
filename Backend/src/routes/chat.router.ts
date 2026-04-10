import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  addGroupMembers,
  createGroupChat,
  getChats,
  getOrCreatePrivateChat,
  leaveGroupChat,
  removeGroupMember,
  updateGroupChat,
} from "../controllers/chat.controller";

const router = Router();

router.get("/", authMiddleware, getChats);
router.post("/private", authMiddleware, getOrCreatePrivateChat);
router.post("/group", authMiddleware, createGroupChat);
router.patch("/:chatId/group", authMiddleware, updateGroupChat);
router.post("/:chatId/group/members", authMiddleware, addGroupMembers);
router.delete("/:chatId/group/members/:memberId", authMiddleware, removeGroupMember);
router.post("/:chatId/group/leave", authMiddleware, leaveGroupChat);

export default router;
