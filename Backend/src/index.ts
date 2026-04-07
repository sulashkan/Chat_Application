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
import messageRouter from "./routes/message.router"

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

connectDB();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

socketServer(io);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);


const PORT = process.env.PORT || 8000;

const startServer = (port: string | number) => {
  const portNum = typeof port === "string" ? parseInt(port, 10) : port;
  server.listen(portNum, () => {
    console.log(`Server running on ${portNum}`);
  });
};

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    const address = server.address();
    const currentPort = (typeof address === "object" && address) ? address.port : 8000;
    console.log(`Port ${currentPort} is busy, trying port ${currentPort + 1}`);
    server.listen(currentPort + 1);
  } else {
    console.error(err);
    process.exit(1);
  }
});

startServer(PORT);