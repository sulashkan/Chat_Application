import { useState, useCallback , useEffect } from 'react';
import { requestNotificationPermission } from "../utils/showNotification";
import { Sidebar } from '../components/Sidebar/Sidebar';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { useSocket } from '../hooks/useSocket';
import { useChatCtx } from '../context/ChatContext';
import type { Message } from '../types';

export const ChatPage = () => {
  const { activeChat } = useChatCtx();
  const [incomingMessage, setIncomingMessage] = useState<Message | null>(null);
  const [newMsgChatId, setNewMsgChatId] = useState<string>('');

  useEffect(() => {
  requestNotificationPermission();
}, []);

  const handleMessage = useCallback((msg: Message) => {
    setIncomingMessage(msg);
    setNewMsgChatId(msg.chatId);
  }, []);

  useSocket({ onMessage: handleMessage });

  return (
    <div className="flex min-h-screen bg-[#111b21] overflow-hidden">
      <div
        className={[
          "w-full border-r border-[#ffffff1a] flex flex-col md:w-[24rem] md:min-w-88 md:max-w-104",
          activeChat ? "hidden md:flex" : "flex",
        ].join(" ")}
      >
        <Sidebar onMessageReceived={newMsgChatId} />
      </div>

      <div
        className={[
          "min-w-0 flex-1 flex-col",
          activeChat ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        <ChatWindow incomingMessage={incomingMessage} />
      </div>
    </div>
  );
};
