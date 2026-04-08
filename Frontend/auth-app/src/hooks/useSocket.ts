import { useEffect } from 'react';
import { getSocket } from '../socket';
import { useChatCtx } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';
import { playNotification } from '../utils/playNotification';

interface UseSocketOptions {
  onMessage: (msg: Message) => void;
  onMessagesSeen?: (chatId: string) => void;
}

export const useSocket = ({ onMessage, onMessagesSeen }: UseSocketOptions) => {
  const { isAuthenticated } = useAuth();
  const { setOnlineUsers, setTypingUsers, activeChat } = useChatCtx();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    const handleOnlineUsers = (ids: string[]) => {
      setOnlineUsers(ids);
    };

    const handleReceiveMessage = (msg: Message) => {
      console.log(activeChat?._id)
        if (msg.chatId === activeChat?._id) {
          console.log("msg")
          playNotification();
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

export const sendMessage = (chatId: string, text: string) => {
  const socket = getSocket();
  socket.emit('send_message', { chatId, text });
};

export const sendTyping = (to: string) => {
  const socket = getSocket();
  socket.emit('typing', { to });
};

export const markMessagesSeen = (from: string, chatId: string) => {
  const socket = getSocket();
  socket.emit('mark_seen', { from, chatId });
};
