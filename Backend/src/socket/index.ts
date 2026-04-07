
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import onlineUsers from "./onlineUsers";
import Message from "../models/message.model";
import Chat from "../models/chat.model";

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

  //  Get chat members
  const chat = await Chat.findById(chatId);

  if (!chat) return;

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
      const receiverSocketId = onlineUsers.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("show_typing", {
          from: userId,
        });
      }
    });

    // Mark messages as seen
    socket.on("mark_seen", async ({ from }) => {
      await Message.updateMany(
        { senderId: from, receiverId: userId, seen: false },
        { seen: true }
      );

      const senderSocketId = onlineUsers.get(from);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_seen");
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