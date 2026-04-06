import { Request, Response } from "express";
import User from "../models/user.model";

export const getUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const users = await User.find({ _id: { $ne: req.user?.id } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};