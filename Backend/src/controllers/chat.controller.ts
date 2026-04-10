import { Request, Response } from "express";
import Chat from "../models/chat.model";
import Message from "../models/message.model";
import User from "../models/user.model";

const enrichChat = async (chat: any) => {
  let lastMessage = chat.lastMessage;
  if (chat.lastMessage) {
    lastMessage = await Message.findById(chat.lastMessage).lean();
  }

  let memberDetails: any[] = [];
  if (chat.isGroup) {
    memberDetails = await User.find({ _id: { $in: chat.members } })
      .select("_id name email avatar")
      .lean();
  }

  return {
    ...chat,
    lastMessage,
    memberDetails,
  };
};

const getContactIds = (user: any): string[] => user?.contacts ?? [];

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
      visibleChats.map((chat) => enrichChat(chat))
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

export const createGroupChat = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, memberIds } = req.body as { name?: string; memberIds?: string[] };

    const uniqueMemberIds = Array.from(new Set((memberIds ?? []).filter(Boolean)));
    if (uniqueMemberIds.length < 1) {
      res.status(400).json({ message: "Select at least one contact to create a group" });
      return;
    }

    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const contacts = getContactIds(currentUser);
    const invalidMember = uniqueMemberIds.find((memberId) => !contacts.includes(memberId));
    if (invalidMember) {
      res.status(403).json({ message: "Groups can only include your contacts" });
      return;
    }

    const resolvedGroupName = name?.trim() || "New Group";

    const groupMembers = Array.from(new Set([userId, ...uniqueMemberIds]));
    const group = await Chat.create({
      members: groupMembers,
      isGroup: true,
      groupName: resolvedGroupName,
      groupAdmin: userId,
    });

    const fullGroup = await enrichChat(group.toObject());
    res.status(201).json(fullGroup);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const updateGroupChat = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const { name } = req.body as { name?: string };

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (chat.groupAdmin !== userId) {
      res.status(403).json({ message: "Only the group admin can update this chat" });
      return;
    }

    if (!name?.trim()) {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    chat.groupName = name.trim();
    await chat.save();

    res.json(await enrichChat(chat.toObject()));
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const addGroupMembers = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const { memberIds } = req.body as { memberIds?: string[] };

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (chat.groupAdmin !== userId) {
      res.status(403).json({ message: "Only the group admin can add members" });
      return;
    }

    const uniqueMemberIds = Array.from(new Set((memberIds ?? []).filter(Boolean)));
    if (uniqueMemberIds.length === 0) {
      res.status(400).json({ message: "Select at least one contact to add" });
      return;
    }

    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const contacts = getContactIds(currentUser);
    const invalidMember = uniqueMemberIds.find((memberId) => !contacts.includes(memberId));
    if (invalidMember) {
      res.status(403).json({ message: "Only your contacts can be added to the group" });
      return;
    }

    chat.members = Array.from(new Set([...chat.members, ...uniqueMemberIds]));
    await chat.save();

    res.json(await enrichChat(chat.toObject()));
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const removeGroupMember = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { chatId, memberId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (chat.groupAdmin !== userId) {
      res.status(403).json({ message: "Only the group admin can remove members" });
      return;
    }

    if (memberId === chat.groupAdmin) {
      res.status(400).json({ message: "The admin cannot be removed from the group" });
      return;
    }

    chat.members = chat.members.filter((id) => id !== memberId);

    if (chat.members.length < 2) {
      await Chat.findByIdAndDelete(chatId);
      res.json({ deleted: true });
      return;
    }

    await chat.save();
    res.json(await enrichChat(chat.toObject()));
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const leaveGroupChat = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (!chat.members.includes(userId)) {
      res.status(403).json({ message: "You are not a member of this group" });
      return;
    }

    chat.members = chat.members.filter((id) => id !== userId);

    if (chat.members.length < 2) {
      await Chat.findByIdAndDelete(chatId);
      res.json({ deleted: true });
      return;
    }

    if (chat.groupAdmin === userId) {
      chat.groupAdmin = chat.members[0];
    }

    await chat.save();
    res.json(await enrichChat(chat.toObject()));
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
