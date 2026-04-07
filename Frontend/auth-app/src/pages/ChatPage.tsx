import { useState, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { useSocket } from '../hooks/useSocket';
// import { useChatCtx } from '../context/ChatContext';
import type { Message } from '../types';

export const ChatPage = () => {
  // const { activeChat } = useChatCtx();
  const [incomingMessage, setIncomingMessage] = useState<Message | null>(null);
  const [newMsgChatId, setNewMsgChatId] = useState<string>('');

  const handleMessage = useCallback((msg: Message) => {
    setIncomingMessage(msg);
    setNewMsgChatId(msg.chatId);
  }, []);

  useSocket({ onMessage: handleMessage });

  return (
    <div className="flex h-screen bg-[#111b21] overflow-hidden">
      {/* Sidebar — fixed 360px width like WhatsApp */}
      <div className="w-90 min-w-75 shrink-0 border-r border-[#ffffff1a] flex flex-col">
        <Sidebar onMessageReceived={newMsgChatId} />
      </div>

      {/* Chat window — fills remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow incomingMessage={incomingMessage} />
      </div>
    </div>
  );
};
