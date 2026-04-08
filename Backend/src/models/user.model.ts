import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  provider?: string;
  providerId?: string;
  contacts: string[];
  sentRequests: string[];
  receivedRequests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      required: false,
    },
    providerId: {
      type: String,
      required: false,
    },
    contacts: {
      type: [{ type: String }],
      default: [],
    },
    sentRequests: {
      type: [{ type: String }],
      default: [],
    },
    receivedRequests: {
      type: [{ type: String }],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);