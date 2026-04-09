import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import session from "express-session";
import passport from "./config/passport";
import cors from "cors";

import connectDB from "./config/db";
import authRouter from "./routes/auth.router";
import userRouter from "./routes/user.router";
import chatRouter from "./routes/chat.router";
import socketServer from "./socket";
import messageRouter from "./routes/message.router";
import uploadRouter from "./routes/upload.routes";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://chat-application-eight-sage.vercel.app", // update with your current Vercel URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

socketServer(io);

connectDB();

app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/upload", uploadRouter);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});