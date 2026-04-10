import { useEffect } from 'react';
import { getSocket } from '../socket';
import { useChatCtx } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';
import { playNotification } from '../utils/playNotification';
import { showNotification } from '../utils/showNotification';

interface UseSocketOptions {
  onMessage: (msg: Message) => void;
  onMessagesSeen?: (chatId: string) => void;
}

export const useSocket = ({ onMessage, onMessagesSeen }: UseSocketOptions) => {
  const { isAuthenticated } = useAuth();
const { setOnlineUsers, setTypingUsers, activeChat, setChats } = useChatCtx();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    const handleOnlineUsers = (ids: string[]) => {
      setOnlineUsers(ids);
    };

   const handleReceiveMessage = (msg: Message) => {
  const isChatOpen = msg.chatId === activeChat?._id;

  if (!isChatOpen) {
   setChats(prev =>
  prev.map(chat => {
    if (chat._id !== msg.chatId) return chat;

    const isActive = chat._id === activeChat?._id;

    return {
      ...chat,
      lastMessage: msg,
      unreadCount: isActive ? 0 : (chat.unreadCount || 0) + 1,
    };
  })
  // move chat to top
  .sort((a, b) =>
    a._id === msg.chatId ? -1 : b._id === msg.chatId ? 1 : 0
  )
);

    playNotification();

    const body =
      msg.text ??
      (msg.mediaType === 'image'
        ? 'Image'
        : msg.mediaType === 'video'
        ? 'Video'
        : msg.mediaType === 'file'
        ? 'File'
        : 'New message');

    showNotification('New Message', body);
  }

  onMessage(msg);
};
    const handleShowTyping = ({ from }: { from: string }) => {
      if (activeChat && activeChat.members.includes(from)) {
        setTypingUsers((prev: string[]) => {
          if (!prev.includes(from)) {
            return [...prev, from];
          }
          return prev;
        });

        setTimeout(() => {
          setTypingUsers((prev: string[]) => prev.filter((id: string) => id !== from));
        }, 3000);
      }
    };

    const handleMessagesSeen = ({ chatId }: { chatId: string }) => {
      onMessagesSeen?.(chatId);
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('show_typing', handleShowTyping);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('show_typing', handleShowTyping);
      socket.off('messages_seen', handleMessagesSeen);
    };
  }, [isAuthenticated, activeChat, onMessagesSeen]);
};

export const sendMessage = (
  chatId: string,
  payload: { text?: string; mediaUrl?: string }
) => {
  const socket = getSocket();
  socket.emit('send_message', { chatId, ...payload });
};

export const sendTyping = (to: string) => {
  const socket = getSocket();
  socket.emit('typing', { to });
};



export const markMessagesSeen = (from: string, chatId: string) => {
  const socket = getSocket();
  socket.emit('mark_seen', { from, chatId });
};
