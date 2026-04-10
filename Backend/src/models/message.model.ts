import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  chatId: string;
  sender: string;
  text?: string;
  mediaUrl?: string;
  seenBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    chatId: { type: String, required: true },
    sender: { type: String, required: true },
    text: String,
    mediaUrl: String,
    seenBy: [{ type: String }],  
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);