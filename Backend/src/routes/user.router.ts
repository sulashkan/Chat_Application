import express from "express";
import {
  getUsers,
  sendRequest,
  cancelRequest,
  acceptRequest,
  rejectRequest,
  removeContact,
  blockUser,
} from "../controllers/user.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.post("/request/:userId", authMiddleware, sendRequest);
router.post("/request/:userId/cancel", authMiddleware, cancelRequest);
router.post("/request/:userId/take-back", authMiddleware, cancelRequest);
router.post("/request/:userId/accept", authMiddleware, acceptRequest);
router.post("/request/:userId/reject", authMiddleware, rejectRequest);
router.post("/contact/:userId/remove", authMiddleware, removeContact);
router.post("/contact/:userId/block", authMiddleware, blockUser);
router.post("/request/:userId/remove", authMiddleware, removeContact);
router.post("/request/:userId/block", authMiddleware, blockUser);

export default router;
