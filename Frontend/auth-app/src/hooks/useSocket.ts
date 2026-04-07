import { useEffect } from 'react';
import { getSocket } from '../socket';
import { useChatCtx } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';

interface UseSocketOptions {
  onMessage: (msg: Message) => void;
}

export const useSocket = ({ onMessage }: UseSocketOptions) => {
  const { isAuthenticated } = useAuth();
  const { setOnlineUsers } = useChatCtx();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    socket.on('online_users', (ids: string[]) => {
      setOnlineUsers(ids);
    });

    socket.on('receive_message', (msg: Message) => {
      onMessage(msg);
    });

    return () => {
      socket.off('online_users');
      socket.off('receive_message');
    };
  }, [isAuthenticated]);
};

export const sendMessage = (chatId: string, text: string) => {
  const socket = getSocket();
  socket.emit('send_message', { chatId, text });
};
