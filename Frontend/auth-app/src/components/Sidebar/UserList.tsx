import { useEffect, useState } from 'react';
import { getUsers, getOrCreatePrivateChat, sendUserRequest, acceptUserRequest, rejectUserRequest } from '../../api';
import { useChatCtx } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../UI/Avatar';
import { SearchBar } from '../UI/SearchBar';
import type { User } from '../../types';

interface UserListProps {
  onClose: () => void;
}

export const UserList = ({ onClose }: UserListProps) => {
  const { user: me } = useAuth();
  const { setUsers, setActiveChat, onlineUsers } = useChatCtx();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(res => {
        const others = res.data.filter(u => u._id !== me?._id);
        setAllUsers(others);
        setUsers(others);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenChat = async (userId: string) => {
    setOpening(userId);
    try {
      const user = allUsers.find(u => u._id === userId);
      if (!user?.isContact) {
        return;
      }
      const { data: chat } = await getOrCreatePrivateChat(userId);
      const otherUser = allUsers.find(u => u._id === userId);
      setActiveChat({ ...chat, otherUser });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33]">
        <button
          onClick={onClose}
          className="text-[#8696a0] hover:text-[#e9edef] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-[#e9edef] font-semibold text-base">New Chat</h2>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search contacts" />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-[#202c33]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#202c33] rounded w-1/2" />
                  <div className="h-2 bg-[#202c33] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#8696a0] text-sm">
            <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="1.5" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
            </svg>
            No contacts found
          </div>
        ) : (
          filtered.map(u => (
            <div
              key={u._id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] transition-colors text-left"
            >
              <Avatar
                name={u.name}
                src={u.avatar}
                online={onlineUsers.includes(u._id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[#e9edef] text-[15px] font-medium truncate">{u.name}</p>
                <p className="text-[#8696a0] text-[13px] truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.isContact ? (
                  <button
                    onClick={() => handleOpenChat(u._id)}
                    disabled={opening === u._id}
                    className="px-3 py-1 rounded-full bg-[#00a884] text-white text-xs font-semibold"
                  >
                    Chat
                  </button>
                ) : u.requestReceived ? (
                  <>
                    <button
                      onClick={async () => {
                        setOpening(u._id);
                        try {
                          await acceptUserRequest(u._id);
                          setAllUsers((prev) =>
                            prev.map((item) =>
                              item._id === u._id
                                ? { ...item, isContact: true, requestReceived: false, requestSent: false }
                                : item
                            )
                          );
                        } finally {
                          setOpening(null);
                        }
                      }}
                      disabled={opening === u._id}
                      className="px-3 py-1 rounded-full bg-[#00a884] text-white text-xs font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        setOpening(u._id);
                        try {
                          await rejectUserRequest(u._id);
                          setAllUsers((prev) =>
                            prev.map((item) =>
                              item._id === u._id
                                ? { ...item, requestReceived: false, requestSent: false }
                                : item
                            )
                          );
                        } finally {
                          setOpening(null);
                        }
                      }}
                      disabled={opening === u._id}
                      className="px-3 py-1 rounded-full bg-[#374151] text-[#e9edef] text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </>
                ) : u.requestSent ? (
                  <button
                    disabled
                    className="px-3 py-1 rounded-full bg-[#6b7280] text-[#e9edef] text-xs font-semibold"
                  >
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setOpening(u._id);
                      try {
                        await sendUserRequest(u._id);
                        setAllUsers((prev) =>
                          prev.map((item) =>
                            item._id === u._id ? { ...item, requestSent: true } : item
                          )
                        );
                      } finally {
                        setOpening(null);
                      }
                    }}
                    disabled={opening === u._id}
                    className="px-3 py-1 rounded-full bg-[#00a884] text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
