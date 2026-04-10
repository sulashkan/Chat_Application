import type { Chat, User } from '../types';

export const enrichChat = (
  chat: Chat,
  users: User[],
  currentUserId: string
): Chat => {
  if (chat.isGroup) return chat;

  return {
    ...chat,
    otherUser: users.find((u) =>
      chat.members.some((m: string) => m !== currentUserId && m === u._id)
    ),
  };
};