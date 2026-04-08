import { createContext, useContext, useState, ReactNode } from 'react';
import type { Chat, User } from '../types';

interface ChatContextValue {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  typingUsers: string[];
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat, onlineUsers, setOnlineUsers, users, setUsers, typingUsers, setTypingUsers }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatCtx = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatCtx must be inside ChatProvider');
  return ctx;
};
