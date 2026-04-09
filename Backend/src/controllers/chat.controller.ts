import { Request, Response } from "express";
import Chat from "../models/chat.model";
import Message from "../models/message.model";
import User from "../models/user.model";

export const getChats = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const currentUser = await User.findById(userId).lean();

    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const chats = await Chat.find({ members: userId }).sort({ updatedAt: -1 }).lean();
    const visibleChats = chats.filter((chat) => {
      if (chat.isGroup || chat.members.length !== 2) return true;
      const otherUserId = chat.members.find((id) => id !== userId);
      if (!otherUserId) return false;

      const myContacts = currentUser.contacts ?? [];
      const blockedByMe = (currentUser.blockedUsers ?? []).includes(otherUserId);
      const isMutualContact = myContacts.includes(otherUserId);
      return isMutualContact && !blockedByMe;
    });
      
    const enrichedChats = await Promise.all(
      visibleChats.map(async (chat) => {
        if (chat.lastMessage) {
          const message = await Message.findById(chat.lastMessage).lean();
          return { ...chat, lastMessage: message };
        }
        return chat;
      })
    );

    res.json(enrichedChats);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getOrCreatePrivateChat = async (req: any, res: Response): Promise<void> => {
  try {
    const otherUserId = req.body.userId;
    const userId = req.user?.id;

    if (!otherUserId) {
      res.status(400).json({ message: "userId is required" });
      return;
    }

    if (otherUserId === userId) {
      res.status(400).json({ message: "Cannot create a private chat with yourself" });
      return;
    }

    const user = await User.findById(userId);
    const otherUser = await User.findById(otherUserId);

    if (!user || !otherUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userContacts = user.contacts ?? [];
    const otherContacts = otherUser.contacts ?? [];
    const userBlocked = user.blockedUsers ?? [];
    const otherBlocked = otherUser.blockedUsers ?? [];
    const isMutualContact = userContacts.includes(otherUserId) && otherContacts.includes(userId);
    const eitherBlocked = userBlocked.includes(otherUserId) || otherBlocked.includes(userId);
    if (!isMutualContact) {
      res.status(403).json({ message: "Chat not allowed until request is accepted" });
      return;
    }
    if (eitherBlocked) {
      res.status(403).json({ message: "Chat not allowed for blocked users" });
      return;
    }

    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [userId, otherUserId], $size: 2 },
    }).lean();

    if (chat) {
      if (chat.lastMessage) {
        const message = await Message.findById(chat.lastMessage).lean();
        chat = { ...chat, lastMessage: message } as any;
      }
      res.json(chat);
      return;
    }

    chat = await Chat.create({ members: [userId, otherUserId], isGroup: false });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
