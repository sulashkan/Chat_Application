import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  members: string[];
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: String, required: true }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    groupAdmin: { type: String },
    lastMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);
