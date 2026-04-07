import { Router } from "express";
import Message from "../models/message.model";
import auth from "../middleware/auth.middleware";

const router = Router();

router.get("/:chatId", auth, async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

export default router;