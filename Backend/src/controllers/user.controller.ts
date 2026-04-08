import { Request, Response } from "express";
import User from "../models/user.model";

export const getUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.id).lean();
    const users = await User.find({ _id: { $ne: req.user?.id } }).select("-password").lean();

    const enriched = users.map((user) => {
      const isContact = currentUser?.contacts?.includes(user._id.toString()) ?? false;
      const requestSent = currentUser?.sentRequests?.includes(user._id.toString()) ?? false;
      const requestReceived = currentUser?.receivedRequests?.includes(user._id.toString()) ?? false;

      return {
        ...user,
        isContact,
        requestSent,
        requestReceived,
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

    receiver.receivedRequests = receiver.receivedRequests.filter((id) => id !== senderId);
    sender.sentRequests = sender.sentRequests.filter((id) => id !== receiverId);

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

    receiver.receivedRequests = receiver.receivedRequests.filter((id) => id !== senderId);
    sender.sentRequests = sender.sentRequests.filter((id) => id !== receiverId);

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
