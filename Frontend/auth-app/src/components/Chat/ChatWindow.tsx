import { useEffect, useRef, useState, useCallback } from 'react';
import { getMessages } from '../../api';
import { sendMessage } from '../../hooks/useSocket';
import { useChatCtx } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { DateDivider } from './DateDivider';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import type { Message } from '../../types';
import { format } from 'date-fns';

interface ChatWindowProps {
  incomingMessage: Message | null;
}

// Group messages by date
const groupByDate = (messages: Message[]) => {
  const groups: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const day = format(new Date(msg.createdAt), 'yyyy-MM-dd');
    const last = groups[groups.length - 1];
    if (last?.date === day) {
      last.messages.push(msg);
    } else {
      groups.push({ date: day, messages: [msg] });
    }
  });
  return groups;
};

export const ChatWindow = ({ incomingMessage }: ChatWindowProps) => {
  const { activeChat } = useChatCtx();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }

    setLoading(true);
    setMessages([]);

    getMessages(activeChat._id)
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeChat?._id]);

  // Append incoming real-time message
  useEffect(() => {
    if (!incomingMessage) return;
    if (incomingMessage.chatId !== activeChat?._id) return;
    setMessages(prev => [...prev, incomingMessage]);
  }, [incomingMessage]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback((text: string) => {
    if (!activeChat) return;

    // Optimistic message
    const optimistic: Message = {
      _id: `tmp-${Date.now()}`,
      chatId: activeChat._id,
      sender: user!._id ?? user!.id,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    // Emit via socket
    sendMessage(activeChat._id, text);
  }, [activeChat, user]);

  // Empty state: no chat selected
  if (!activeChat) {
    return (
      <div className="flex-1 chat-bg flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-4 opacity-80">
          <div className="w-24 h-24 rounded-full bg-[#202c33] flex items-center justify-center">
            <svg className="w-12 h-12 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="1.2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[#e9edef] text-xl font-semibold mb-2">ChatApp</h2>
            <p className="text-[#8696a0] text-sm max-w-xs leading-relaxed">
              Select a conversation to start chatting, or open a new chat from the sidebar.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#8696a0] text-xs mt-2 bg-[#182229] px-4 py-2 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" />
            </svg>
            End-to-end encrypted
          </div>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader />

      {/* Encryption notice */}
      <div className="flex justify-center px-4 pt-3">
        <div className="bg-[#182229] text-[#8696a0] text-[12px] px-4 py-2 rounded-lg text-center max-w-md leading-relaxed">
          🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 chat-bg">
        {loading ? (
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}
              >
                <div
                  className={`h-10 rounded-lg ${i % 2 === 0 ? 'bg-[#202c33]' : 'bg-[#005c4b]'}`}
                  style={{ width: `${140 + (i * 30) % 120}px` }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#8696a0] text-sm">
              No messages yet. Say hi! 👋
            </p>
          </div>
        ) : (
          <>
            {grouped.map(group => (
              <div key={group.date}>
                <DateDivider date={group.messages[0].createdAt} />
                <div className="flex flex-col gap-1">
                  {group.messages.map((msg, idx) => {
                    const isMine = msg.sender === user?._id;
                    const isLast = idx === group.messages.length - 1 ||
                      group.messages[idx + 1]?.sender !== msg.sender;
                    return (
                      <MessageBubble
                        key={msg._id}
                        message={msg}
                        isMine={isMine}
                        showTail={isLast}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
};
