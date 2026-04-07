import { Avatar } from '../UI/Avatar';
import { useChatCtx } from '../../context/ChatContext';

export const ChatHeader = () => {
  const { activeChat, onlineUsers } = useChatCtx();
  const other = activeChat?.otherUser;
  if (!other) return null;

  const isOnline = onlineUsers.includes(other._id);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#202c33] border-b border-[#ffffff0d]">
      <div className="flex items-center gap-3">
        <Avatar name={other.name} src={other.avatar} online={isOnline} />
        <div>
          <p className="text-[#e9edef] font-semibold text-[15px] leading-tight">{other.name}</p>
          <p className="text-[12px] text-[#8696a0] leading-tight">
            {isOnline ? (
              <span className="text-[#00a884]">online</span>
            ) : (
              'last seen recently'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374151] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374151] transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
