import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Authorization header missing or invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    if (!decoded) {
      res.status(401).json({ message: "please login first" });
      return;
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "invalid token" });
  }
};

export default authMiddleware;