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
app.set("trust proxy", 1);

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, "");

const allowedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
      process.env.CORS_ORIGINS,
      "https://chat-application-eight-sage.vercel.app",
    ]
      .flatMap((value) => (value ? value.split(",") : []))
      .map((value) => value.trim())
      .filter(Boolean)
      .map(normalizeOrigin)
  )
);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

socketServer(io);

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
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 8000;

const startServer = async (): Promise<void> => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  });
};

void startServer();
