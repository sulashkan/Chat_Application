import type { User } from './auth';
export * from './auth';

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  seen?: boolean;
}

export interface Chat {
  _id: string;
  members: string[];
  lastMessage?: Message;
  unreadCount?: number;
  otherUser?: User;
}
