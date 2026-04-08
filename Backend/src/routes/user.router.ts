import express from "express";
import { getUsers, sendRequest, acceptRequest, rejectRequest } from "../controllers/user.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.post("/request/:userId", authMiddleware, sendRequest);
router.post("/request/:userId/accept", authMiddleware, acceptRequest);
router.post("/request/:userId/reject", authMiddleware, rejectRequest);

export default router;
