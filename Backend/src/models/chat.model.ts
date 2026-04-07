import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  members: string[];
  isGroup: boolean;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: String, required: true }],
    isGroup: { type: Boolean, default: false },
    lastMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);