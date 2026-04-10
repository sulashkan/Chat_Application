import { Avatar } from '../UI/Avatar';
import { useChatCtx } from '../../context/ChatContext';

export const ChatHeader = () => {
  const { activeChat, onlineUsers, setActiveChat, setSidebarPanel } = useChatCtx();
  const other = activeChat?.otherUser;
  if (!activeChat) return null;

  const isGroup = Boolean(activeChat.isGroup);
  const isOnline = other ? onlineUsers.includes(other._id) : false;
  const title = isGroup ? activeChat.groupName || 'Unnamed group' : other?.name || 'Unknown';
  const subtitle = isGroup
    ? `${activeChat.memberDetails?.length ?? activeChat.members.length} members`
    : isOnline
    ? 'online'
    : 'last seen recently';

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 md:px-4 bg-[#202c33] border-b border-[#ffffff0d]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setActiveChat(null)}
          className="md:hidden p-2 -ml-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374151] transition-colors"
          aria-label="Back to chats"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Avatar name={title} src={isGroup ? undefined : other?.avatar} online={isGroup ? undefined : isOnline} />
        <div className="min-w-0">
          <p className="text-[#e9edef] font-semibold text-[15px] leading-tight truncate">{title}</p>
          <p className="text-[12px] text-[#8696a0] leading-tight">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isGroup && (
          <button
            type="button"
            onClick={() => setSidebarPanel('manage-group')}
            className="rounded-full px-3 py-2 text-xs font-semibold text-[#e9edef] hover:bg-[#374151] transition-colors"
          >
            Manage
          </button>
        )}
        <button className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374151] transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
