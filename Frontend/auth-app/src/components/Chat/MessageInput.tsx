import { useState, KeyboardEvent, useCallback, useRef } from 'react';
import { sendTyping } from '../../hooks/useSocket';
import { useChatCtx } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [text, setText] = useState('');
  const { activeChat } = useChatCtx();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<number>();

  const handleTyping = useCallback(() => {
    if (!activeChat || !text.trim()) return;
    
    // Get the current user ID
    const currentUserId = user?._id || user?.id;
    // Get the other user in the chat
    const otherUser = activeChat.members.find(id => id !== currentUserId);
    if (otherUser) {
      sendTyping(otherUser);
    }
  }, [activeChat, text, user]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator
    handleTyping();
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      // Could emit stop_typing here if needed
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 px-3 py-2 bg-[#202c33]">
      {/* Emoji button */}
      <button className="p-2 text-[#8696a0] hover:text-[#e9edef] transition-colors flex-shrink-0 mb-0.5">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
          <path strokeLinecap="round" strokeWidth="1.8" d="M8 13s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Attachment button */}
      <button className="p-2 text-[#8696a0] hover:text-[#e9edef] transition-colors flex-shrink-0 mb-0.5">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="1.8" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      {/* Textarea */}
      <div className="flex-1 bg-[#2a3942] rounded-lg overflow-hidden">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="Type a message"
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent px-4 py-3 text-[15px] text-[#e9edef] placeholder-[#8696a0] outline-none resize-none max-h-32 leading-relaxed"
          style={{ minHeight: '44px' }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="p-2.5 bg-[#00a884] hover:bg-[#008069] disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex-shrink-0 transition-colors mb-0.5"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="2" d="M22 2L11 13" />
          <path strokeLinecap="round" strokeWidth="2" d="M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
};
