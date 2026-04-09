import { Router } from "express";
import Message from "../models/message.model";
import Chat from "../models/chat.model";
import User from "../models/user.model";
import auth from "../middleware/auth.middleware";

const router = Router();

router.get("/:chatId", auth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId).lean();
    if (!chat || !chat.members.includes(userId)) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    if (!chat.isGroup && chat.members.length === 2) {
      const otherUserId = chat.members.find((id) => id !== userId);
      const me = await User.findById(userId).lean();
      const otherUser = otherUserId ? await User.findById(otherUserId).lean() : null;

      if (!me || !otherUser || !otherUserId) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const myContacts = me.contacts ?? [];
      const otherContacts = otherUser.contacts ?? [];
      const myBlocked = me.blockedUsers ?? [];
      const otherBlocked = otherUser.blockedUsers ?? [];
      const isMutualContact = myContacts.includes(otherUserId) && otherContacts.includes(userId);
      const eitherBlocked = myBlocked.includes(otherUserId) || otherBlocked.includes(userId);

      if (!isMutualContact || eitherBlocked) {
        res.status(403).json({ message: "Chat not allowed for this user" });
        return;
      }
    }

    const messages = await Message.find({
      chatId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
