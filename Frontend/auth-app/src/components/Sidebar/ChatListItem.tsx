import { Avatar } from '../UI/Avatar';
import { formatChatTime } from '../../utils/format';
import type { Chat } from '../../types';
import { useChatCtx } from '../../context/ChatContext';
import clsx from 'clsx';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem = ({ chat, isActive, onClick }: ChatListItemProps) => {
  const { onlineUsers } = useChatCtx();
  const other = chat.otherUser;
  if (!chat.isGroup && !other) return null;

  const displayName = chat.isGroup ? chat.groupName || 'Unnamed group' : other?.name || 'Unknown';
  const isOnline = other ? onlineUsers.includes(other._id) : false;
  const lastMsg = chat.lastMessage;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-[#ffffff0d]',
        isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
      )}
    >
<Avatar
  name={displayName}
  src={
    chat.isGroup
      ? chat.memberDetails?.[0]?.avatar
      : other?.avatar
  }
/>
      <div className="flex-1 min-w-0">
       <div className="flex items-start justify-between">
  <div className="min-w-0">
    <p className="text-[#e9edef] text-[15px] font-medium truncate">
      {displayName}
    </p>
    <p className="text-[#8696a0] text-[13px] truncate mt-0.5">
      {lastMsg?.text ?? (
        <span className="italic opacity-60">No messages yet</span>
      )}
    </p>
  </div>

  <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
    {lastMsg && (
      <span className="text-[11px] text-[#8696a0]">
        {formatChatTime(lastMsg.createdAt)}
      </span>
    )}

    {(chat.unreadCount ?? 0) > 0 && (
      <span className="bg-[#00a884] text-white text-[11px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
        {chat.unreadCount}
      </span>
    )}
  </div>
</div>
      </div>
    </button>
  );
};
