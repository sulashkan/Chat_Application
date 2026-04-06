import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  text?: string;
  mediaUrl?: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String },
    mediaUrl: { type: String },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IMessage>("Message", messageSchema);