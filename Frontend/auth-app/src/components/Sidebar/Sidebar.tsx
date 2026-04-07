import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatCtx } from '../../context/ChatContext';
import { getMyChats, getUsers } from '../../api';
// import { Avatar } from '../UI/Avatar';
import { SearchBar } from '../UI/SearchBar';
import { ChatListItem } from './ChatListItem';
import { UserList } from './UserList';
import type { Chat, User } from '../../types';

interface SidebarProps {
  onMessageReceived: string;
}

export const Sidebar = ({ onMessageReceived }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { activeChat, setActiveChat, onlineUsers, setUsers } = useChatCtx();
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setLocalUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  // Load users for name resolution
  useEffect(() => {
    getUsers().then(res => {
      setLocalUsers(res.data);
      setUsers(res.data);
    });
  }, []);

  // Load chats
  const loadChats = () => {
    getMyChats()
      .then(res => {
        const enriched = res.data.map((chat: Chat) => ({
          ...chat,
          otherUser: users.find(u => chat.members.find((m: string) => m !== user?._id) === u._id
            || chat.members.some((m: string) => m !== user?._id && m === u._id)
          ),
        }));
        setChats(enriched);
      })
      .finally(() => setLoadingChats(false));
  };

  useEffect(() => {
    if (users.length > 0) loadChats();
  }, [users]);

  // When a new message comes in, bump that chat to top
  useEffect(() => {
    if (!activeChat) return;
    // Update last message preview when chat is active (new msg in window)
  }, [onMessageReceived]);

  const filtered = chats.filter(c =>
    c.otherUser?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChatClick = (chat: Chat) => {
    setActiveChat(chat);
  };

  if (showNewChat) {
    return <UserList onClose={() => { setShowNewChat(false); loadChats(); }} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.75 bg-[#202c33]">
        <div className="flex items-center gap-3">
          {/* {user && <Avatar name={user.name} src={user.avatar} size="sm" />} */}
          <span className="text-[#e9edef] font-semibold text-base">{user?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="New Chat"
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374151] transition-colors"
          >
            {/* New chat icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button
            title="Logout"
            onClick={logout}
            className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374151] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Online badge strip */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-1.5 border-b border-[#ffffff0d]">
          <p className="text-[11px] text-[#00a884] font-semibold tracking-wider uppercase">
            {onlineUsers.length} online
          </p>
        </div>
      )}

      {/* Chats */}
      <div className="flex-1 gap-2 overflow-y-auto">
        {loadingChats ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#ffffff0d] animate-pulse">
                <div className="w-11 h-11 rounded-full bg-[#202c33]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#202c33] rounded w-2/5" />
                  <div className="h-2 bg-[#202c33] rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#8696a0] text-sm gap-3">
            <svg className="w-14 h-14 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="1.2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-center">
              <p className="font-medium mb-1">No chats yet</p>
              <p className="text-xs opacity-60">Click the chat icon to start a conversation</p>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-1 px-4 py-2 bg-[#00a884] text-white text-sm rounded-full font-medium hover:bg-[#008069] transition-colors"
            >
              New Chat
            </button>
          </div>
        ) : (
          filtered.map(chat => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              isActive={activeChat?._id === chat._id}
              onClick={() => handleChatClick(chat)}
            />
          ))
        )}
      </div>
    </div>
  );
};
