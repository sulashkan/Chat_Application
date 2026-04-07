import { createContext, useContext, useState, ReactNode } from 'react';
import type { Chat, User } from '../types';

interface ChatContextValue {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  onlineUsers: string[];
  setOnlineUsers: (ids: string[]) => void;
  users: User[];
  setUsers: (u: User[]) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat, onlineUsers, setOnlineUsers, users, setUsers }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatCtx = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatCtx must be inside ChatProvider');
  return ctx;
};
