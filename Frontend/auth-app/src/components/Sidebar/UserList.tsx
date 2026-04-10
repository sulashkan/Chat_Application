import { useEffect, useMemo, useState } from 'react';
import {
  acceptUserRequest,
  addGroupMembers,
  blockUserContact,
  cancelUserRequest,
  createGroupChat,
  getOrCreatePrivateChat,
  getUsers,
  leaveGroupChat,
  removeGroupMember,
  rejectUserRequest,
  removeUserContact,
  sendUserRequest,
  updateGroupChat,
} from '../../api';
import { useChatCtx } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../UI/Avatar';
import { SearchBar } from '../UI/SearchBar';
import type { Chat, User } from '../../types';
import { enrichChat } from '../../utils/enrichChat';

interface UserListProps {
  mode: 'new-chat' | 'create-group' | 'manage-group';
  onClose: () => void;
  onChatUpdated?: (
    chat?: Chat | null,
    options?: { nextPanel?: 'chats' | 'manage-group' }
  ) => void;
}

export const UserList = ({ mode, onClose, onChatUpdated }: UserListProps) => {
  const { user: me } = useAuth();
   if (!me) return null;
  const currentUserId:string = me?._id || me?.id;
  const { setUsers, setActiveChat, onlineUsers, activeChat } = useChatCtx();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState(activeChat?.groupName ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    getUsers()
      .then((res) => {
        const others = res.data.filter((u) => u._id !== currentUserId);
        setAllUsers(others);
        setUsers(others);
      })
      .finally(() => setLoading(false));
  }, [currentUserId, setUsers]);

  useEffect(() => {
    setSelectedIds([]);
    setSearch('');
    setError(null);
    setGroupName(mode === 'manage-group' ? activeChat?.groupName ?? '' : '');
  }, [mode, activeChat?._id, activeChat?.groupName]);

  const currentGroupMemberIds = useMemo(
    () => new Set(activeChat?.memberDetails?.map((member) => member._id) ?? activeChat?.members ?? []),
    [activeChat]
  );

  const manageableUsers = useMemo(() => {
    if (mode === 'manage-group') {
      return allUsers.filter((user) => user.isContact && !currentGroupMemberIds.has(user._id));
    }

    if (mode === 'create-group') {
      return allUsers.filter((user) => user.isContact);
    }

    return allUsers;
  }, [allUsers, currentGroupMemberIds, mode]);

  const filtered = manageableUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleOpenChat = async (userId: string) => {
    setOpening(userId);
    try {
      const user = allUsers.find((u) => u._id === userId);
      if (!user?.isContact) {
        return;
      }

      const { data: chat } = await getOrCreatePrivateChat(userId);
      const otherUser = allUsers.find((u) => u._id === userId);
      setActiveChat({ ...chat, otherUser });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setOpening(null);
    }
  };

  const updateUsersState = (updater: (prev: User[]) => User[]) => {
    setAllUsers((prev) => {
      const next = updater(prev);
      setUsers(next);
      return next;
    });
  };

  const handleCreateGroup = async () => {
  if (selectedIds.length < 2) {
    setError('Select at least one contact. Your profile is added automatically.');
    return;
  }

  setSubmitting(true);
  setError(null);

  try {
    const fallbackName = selectedIds.length === 2 ? 'New duo' : 'New group';
    const { data } = await createGroupChat(
      groupName.trim() || fallbackName,
      selectedIds
    );

    const enriched = enrichChat(data, allUsers, currentUserId);

    setActiveChat(enriched);

    onChatUpdated?.(enriched, { nextPanel: 'manage-group' });

  } catch (err: any) {
    setError(err?.response?.data?.message || 'Could not create the group.');
  } finally {
    setSubmitting(false);
  }
};

  const handleRenameGroup = async () => {
    if (!activeChat?._id) return;
    if (!groupName.trim()) {
      setError('Enter a group name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data } = await updateGroupChat(activeChat._id, groupName.trim());
      setActiveChat(data);
      onChatUpdated?.(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not rename the group.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMembers = async () => {
    if (!activeChat?._id) return;
    if (selectedIds.length === 0) {
      setError('Select at least one contact to add.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data } = await addGroupMembers(activeChat._id, selectedIds);
      setSelectedIds([]);
      setActiveChat(data);
      onChatUpdated?.(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not add members.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeChat?._id) return;

    setSubmitting(true);
    setError(null);
    try {
      await leaveGroupChat(activeChat._id);
      setActiveChat(null);
      onChatUpdated?.(null);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not leave the group.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeChat?._id) return;

    setOpening(memberId);
    setError(null);
    try {
      const { data } = await removeGroupMember(activeChat._id, memberId);
      if (data?.deleted) {
        setActiveChat(null);
        onChatUpdated?.(null);
        onClose();
        return;
      }
      setActiveChat(data);
      onChatUpdated?.(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not remove this member.');
    } finally {
      setOpening(null);
    }
  };

  const isGroupAdmin = activeChat?.groupAdmin === currentUserId;

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33]">
        <button
          onClick={onClose}
          className="text-[#8696a0] hover:text-[#e9edef] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h2 className="text-[#e9edef] font-semibold text-base">
            {mode === 'new-chat' ? 'New Chat' : mode === 'create-group' ? 'Create Group' : 'Manage Group'}
          </h2>
          <p className="text-[#8696a0] text-xs">
            {mode === 'new-chat'
              ? 'Open a one-to-one conversation'
              : mode === 'create-group'
              ? 'Choose contacts and start a group'
              : 'Rename, add, remove, or leave'}
          </p>
        </div>
      </div>

      {(mode === 'create-group' || mode === 'manage-group') && (
        <div className="px-4 pt-4 pb-2 border-b border-[#ffffff0d]">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name (optional)"
            className="w-full rounded-xl bg-[#202c33] px-4 py-3 text-[#e9edef] placeholder-[#8696a0] outline-none"
          />
          {mode === 'create-group' && (
            <p className="mt-2 text-xs text-[#8696a0]">
              Your profile is included automatically. Select at least one contact. If you leave the name empty, we will create one for you.
            </p>
          )}
          {mode === 'manage-group' && isGroupAdmin && (
            <button
              type="button"
              onClick={handleRenameGroup}
              disabled={submitting}
              className="mt-3 rounded-full bg-[#00a884] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Save group name
            </button>
          )}
        </div>
      )}

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={
          mode === 'new-chat'
            ? 'Search contacts'
            : mode === 'create-group'
            ? 'Select contacts for your group'
            : 'Add more contacts'
        }
      />

      {error && (
        <p className="mx-4 mb-2 rounded-xl border border-[#7f1d1d] bg-[#2b1517] px-3 py-2 text-sm text-[#fecaca]">
          {error}
        </p>
      )}

      {mode === 'manage-group' && activeChat && (
        <div className="px-4 pb-3 border-b border-[#ffffff0d]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#00a884]">
            Members
          </p>
          <div className="mt-3 space-y-2">
            {(activeChat.memberDetails ?? []).map((member) => {
              const isSelf = member._id === currentUserId;
              const isAdmin = member._id === activeChat.groupAdmin;
              return (
                <div key={member._id} className="flex items-center gap-3 rounded-xl bg-[#182229] px-3 py-2">
                  <Avatar name={member.name} src={member.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#e9edef]">
                      {member.name} {isSelf ? '(You)' : ''}
                    </p>
                    <p className="truncate text-xs text-[#8696a0]">
                      {isAdmin ? 'Group admin' : member.email}
                    </p>
                  </div>
                  {isGroupAdmin && !isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={opening === member._id}
                      className="rounded-full bg-[#7f1d1d] px-3 py-1 text-xs font-semibold text-[#fee2e2] disabled:opacity-60"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLeaveGroup}
            disabled={submitting}
            className="mt-4 rounded-full bg-[#374151] px-4 py-2 text-sm font-semibold text-[#e9edef] disabled:opacity-60"
          >
            Leave group
          </button>
        </div>
      )}

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
          <div className="flex flex-col items-center justify-center h-40 px-6 text-center text-[#8696a0] text-sm">
            No matching contacts found
          </div>
        ) : (
          filtered.map((u) => {
            const selected = selectedIds.includes(u._id);

            if (mode !== 'new-chat') {
              return (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => toggleMember(u._id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selected ? 'bg-[#1d3a36]' : 'hover:bg-[#202c33]'
                  }`}
                >
                  <Avatar name={u.name} src={u.avatar} online={onlineUsers.includes(u._id)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-[#e9edef]">{u.name}</p>
                    <p className="truncate text-[13px] text-[#8696a0]">{u.email}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${selected ? 'border-[#00a884] bg-[#00a884]' : 'border-[#8696a0]'}`}>
                    {selected && (
                      <svg className="h-full w-full text-[#111b21]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.75-3.75a1 1 0 111.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            }

            return (
              <div
                key={u._id}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#202c33] transition-colors text-left"
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
                
                <div className="flex flex-wrap justify-end items-center gap-2 max-w-44">
                  {u.isContact ? (
                    <>
                      <button
                        onClick={() => handleOpenChat(u._id)}
                        disabled={opening === u._id}
                        className="px-3 py-1 rounded-full bg-[#00a884] text-white text-xs font-semibold"
                      >
                        Chat
                      </button>
                      <button
                        onClick={async () => {
                          setOpening(u._id);
                          try {
                            await removeUserContact(u._id);
                            updateUsersState((prev) =>
                              prev.map((item) =>
                                item._id === u._id
                                  ? {
                                      ...item,
                                      isContact: false,
                                      requestSent: false,
                                      requestReceived: false,
                                    }
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
                        Remove
                      </button>
                      <button
                        onClick={async () => {
                          setOpening(u._id);
                          try {
                            await blockUserContact(u._id);
                            updateUsersState((prev) =>
                              prev.map((item) =>
                                item._id === u._id
                                  ? {
                                      ...item,
                                      isContact: false,
                                      requestSent: false,
                                      requestReceived: false,
                                      isBlocked: true,
                                    }
                                  : item
                              )
                            );
                          } finally {
                            setOpening(null);
                          }
                        }}
                        disabled={opening === u._id}
                        className="px-3 py-1 rounded-full bg-[#7f1d1d] text-[#fee2e2] text-xs font-semibold"
                      >
                        Block
                      </button>
                    </>
                  ) : u.requestReceived ? (
                    <>
                      <button
                        onClick={async () => {
                          setOpening(u._id);
                          try {
                            await acceptUserRequest(u._id);
                            updateUsersState((prev) =>
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
                            updateUsersState((prev) =>
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
                      onClick={async () => {
                        setOpening(u._id);
                        try {
                          await cancelUserRequest(u._id);
                          updateUsersState((prev) =>
                            prev.map((item) =>
                              item._id === u._id
                                ? { ...item, requestSent: false, requestReceived: false }
                                : item
                            )
                          );
                        } finally {
                          setOpening(null);
                        }
                      }}
                      disabled={opening === u._id}
                      className="px-3 py-1 rounded-full bg-[#4b5563] text-[#e9edef] text-xs font-semibold"
                    >
                      Take back
                    </button>
                  ) : u.isBlocked ? (
                    <span className="px-3 py-1 rounded-full bg-[#7f1d1d] text-[#fee2e2] text-xs font-semibold">
                      Blocked
                    </span>
                  ) : u.isBlockedBy ? (
                    <span className="px-3 py-1 rounded-full bg-[#1f2937] text-[#9ca3af] text-xs font-semibold">
                      Unavailable
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        setOpening(u._id);
                        try {
                          await sendUserRequest(u._id);
                          updateUsersState((prev) =>
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
            );
          })
        )}
      </div>

      {mode !== 'new-chat' && (
        <div className="border-t border-[#ffffff0d] p-4">
          <div className="mb-3 text-xs text-[#8696a0]">
            Selected: {mode === 'create-group' ? selectedIds.length + 1 : selectedIds.length}
          </div>
          <button
            type="button"
            onClick={mode === 'create-group' ? handleCreateGroup : handleAddMembers}
            disabled={submitting || (mode === 'create-group' ? selectedIds.length < 2 : selectedIds.length === 0)}
            className="w-full rounded-xl bg-[#00a884] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {mode === 'create-group' ? 'Create group' : 'Add selected members'}
          </button>
        </div>
      )}
    </div>
  );
};
