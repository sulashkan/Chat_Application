
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import onlineUsers from "./onlineUsers";
import Message from "../models/message.model";
import Chat from "../models/chat.model";
import User from "../models/user.model";

interface JwtPayload {
  id: string;
}

const socketServer = (io: Server) => {
  // Middleware: authenticate socket with JWT
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      socket.data.userId = decoded.id;
      // console.log("Decoded user from token:", decoded.id);
      next();
    } catch (err) {
      next(new Error("Unauthorized socket"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
      // console.log("User connected:", userId);

    //  Add to online users
    onlineUsers.set(userId, socket.id);
      // console.log("Online users map:", onlineUsers);

    io.emit("online_users", Array.from(onlineUsers.keys()));

    //  Send message
   socket.on("send_message", async ({ chatId, text, mediaUrl }) => {
  const senderId = userId;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.members.includes(senderId)) return;

  if (!chat.isGroup && chat.members.length === 2) {
    const otherUserId = chat.members.find((memberId: string) => memberId !== senderId);
    const sender = await User.findById(senderId).lean();
    const otherUser = otherUserId ? await User.findById(otherUserId).lean() : null;

    if (!sender || !otherUser || !otherUserId) return;

    const senderContacts = sender.contacts ?? [];
    const otherContacts = otherUser.contacts ?? [];
    const senderBlocked = sender.blockedUsers ?? [];
    const otherBlocked = otherUser.blockedUsers ?? [];
    const isMutualContact = senderContacts.includes(otherUserId) && otherContacts.includes(senderId);
    const eitherBlocked = senderBlocked.includes(otherUserId) || otherBlocked.includes(senderId);
    if (!isMutualContact || eitherBlocked) return;
  }

  // Save message
  const message = await Message.create({
    chatId,
    sender: senderId,
    text,
    mediaUrl,
  });

  //  Update last message in chat
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  // Emit to all members except sender
  chat.members.forEach((memberId: string) => {
    if (memberId !== senderId) {
      const memberSocketId = onlineUsers.get(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("receive_message", message);
      }
    }
  });
});

    //  Typing indicator
    socket.on("typing", ({ to }) => {
      if (to === userId) return;
      const receiverSocketId = onlineUsers.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("show_typing", {
          from: userId,
        });
      }
    });

    // Mark messages as seen
    socket.on("mark_seen", async ({ from, chatId }) => {
      await Message.updateMany(
        { chatId, sender: from, seen: false },
        { seen: true }
      );

      const senderSocketId = onlineUsers.get(from);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_seen", { chatId });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};

export default socketServer;
