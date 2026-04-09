import { Response } from "express";
import User from "../models/user.model";

const removeId = (list: string[], id: string) => list.filter((item) => item !== id);

export const getUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const currentUser = await User.findById(currentUserId).lean();
    const users = await User.find({ _id: { $ne: req.user?.id } }).select("-password").lean();

    const enriched = users.map((user) => {
      const otherUserId = user._id.toString();
      const isContact = currentUser?.contacts?.includes(otherUserId) ?? false;
      const requestSent = currentUser?.sentRequests?.includes(otherUserId) ?? false;
      const requestReceived = currentUser?.receivedRequests?.includes(otherUserId) ?? false;
      const isBlocked = currentUser?.blockedUsers?.includes(otherUserId) ?? false;
      const isBlockedBy = user.blockedUsers?.includes(currentUserId) ?? false;

      return {
        ...user,
        isContact,
        requestSent,
        requestReceived,
        isBlocked,
        isBlockedBy,
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const sendRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const receiverId = req.params.userId;

    if (!receiverId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (senderId === receiverId) {
      res.status(400).json({ message: "Cannot send request to yourself" });
      return;
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (sender.contacts.includes(receiverId) && receiver.contacts.includes(senderId)) {
      res.status(400).json({ message: "You are already connected" });
      return;
    }

    const senderBlockedUsers = sender.blockedUsers ?? [];
    const receiverBlockedUsers = receiver.blockedUsers ?? [];
    if (senderBlockedUsers.includes(receiverId) || receiverBlockedUsers.includes(senderId)) {
      res.status(403).json({ message: "Request not allowed for this user" });
      return;
    }

    if (sender.sentRequests.includes(receiverId)) {
      res.status(400).json({ message: "Request already sent" });
      return;
    }

    if (sender.receivedRequests.includes(receiverId)) {
      res.status(400).json({ message: "You already have a request from this user" });
      return;
    }

    sender.sentRequests.push(receiverId);
    receiver.receivedRequests.push(senderId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const cancelRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const receiverId = req.params.userId;

    if (!receiverId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!sender.sentRequests.includes(receiverId)) {
      res.status(400).json({ message: "No sent request for this user" });
      return;
    }

    sender.sentRequests = removeId(sender.sentRequests, receiverId);
    receiver.receivedRequests = removeId(receiver.receivedRequests, senderId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const acceptRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const receiverId = req.user?.id;
    const senderId = req.params.userId;

    if (!senderId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!receiver.receivedRequests.includes(senderId)) {
      res.status(400).json({ message: "No request from this user" });
      return;
    }

    const receiverBlockedUsers = receiver.blockedUsers ?? [];
    const senderBlockedUsers = sender.blockedUsers ?? [];
    if (receiverBlockedUsers.includes(senderId) || senderBlockedUsers.includes(receiverId)) {
      res.status(403).json({ message: "Cannot accept request for blocked user" });
      return;
    }

    receiver.receivedRequests = removeId(receiver.receivedRequests, senderId);
    sender.sentRequests = removeId(sender.sentRequests, receiverId);

    if (!receiver.contacts.includes(senderId)) receiver.contacts.push(senderId);
    if (!sender.contacts.includes(receiverId)) sender.contacts.push(receiverId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const rejectRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const receiverId = req.user?.id;
    const senderId = req.params.userId;

    if (!senderId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    receiver.receivedRequests = removeId(receiver.receivedRequests, senderId);
    sender.sentRequests = removeId(sender.sentRequests, receiverId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const removeContact = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const otherUserId = req.params.userId;

    if (!otherUserId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId);
    const otherUser = await User.findById(otherUserId);

    if (!user || !otherUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.contacts = removeId(user.contacts, otherUserId);
    otherUser.contacts = removeId(otherUser.contacts, userId);

    user.sentRequests = removeId(user.sentRequests, otherUserId);
    user.receivedRequests = removeId(user.receivedRequests, otherUserId);
    otherUser.sentRequests = removeId(otherUser.sentRequests, userId);
    otherUser.receivedRequests = removeId(otherUser.receivedRequests, userId);

    await user.save();
    await otherUser.save();

    res.status(200).json({ message: "Contact removed" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const blockUser = async (req: any, res: Response): Promise<void> => {
  try {
    const blockerId = req.user?.id;
    const blockedUserId = req.params.userId;

    if (!blockedUserId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (blockerId === blockedUserId) {
      res.status(400).json({ message: "Cannot block yourself" });
      return;
    }

    const blocker = await User.findById(blockerId);
    const blockedUser = await User.findById(blockedUserId);

    if (!blocker || !blockedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    blocker.blockedUsers = blocker.blockedUsers ?? [];
    if (!blocker.blockedUsers.includes(blockedUserId)) {
      blocker.blockedUsers.push(blockedUserId);
    }

    blocker.contacts = removeId(blocker.contacts, blockedUserId);
    blockedUser.contacts = removeId(blockedUser.contacts, blockerId);

    blocker.sentRequests = removeId(blocker.sentRequests, blockedUserId);
    blocker.receivedRequests = removeId(blocker.receivedRequests, blockedUserId);
    blockedUser.sentRequests = removeId(blockedUser.sentRequests, blockerId);
    blockedUser.receivedRequests = removeId(blockedUser.receivedRequests, blockerId);

    await blocker.save();
    await blockedUser.save();

    res.status(200).json({ message: "User blocked" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
