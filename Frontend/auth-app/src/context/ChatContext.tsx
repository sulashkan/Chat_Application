import { createContext, useContext, useState, ReactNode } from 'react';
import type { Chat, User } from '../types';

type SidebarPanel = 'chats' | 'new-chat' | 'create-group' | 'manage-group';

interface ChatContextValue {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;

  chats: Chat[];                        
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>; // ✅ ADD

  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  typingUsers: string[];
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>;

  sidebarPanel: SidebarPanel;
  setSidebarPanel: React.Dispatch<React.SetStateAction<SidebarPanel>>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>('chats');
  const [chats, setChats] = useState<Chat[]>([]);

  return (
<ChatContext.Provider
  value={{
    activeChat,
    setActiveChat,

    chats,            
    setChats,         

    onlineUsers,
    setOnlineUsers,
    users,
    setUsers,
    typingUsers,
    setTypingUsers,
    sidebarPanel,
    setSidebarPanel,
  }}
>      {children}
    </ChatContext.Provider>
  );
};

export const useChatCtx = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatCtx must be inside ChatProvider');
  return ctx;
};
