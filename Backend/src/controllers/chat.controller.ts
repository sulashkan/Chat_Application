import { Request, Response } from "express";
import Chat from "../models/chat.model";
import Message from "../models/message.model";
import User from "../models/user.model";

export const getChats = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const chats = await Chat.find({ members: userId }).sort({ updatedAt: -1 }).lean();
      
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
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

    const isMutualContact = user.contacts.includes(otherUserId) && otherUser.contacts.includes(userId);
    if (!isMutualContact) {
      res.status(403).json({ message: "Chat not allowed until request is accepted" });
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
