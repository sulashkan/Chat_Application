import { format, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (date: string): string =>
  format(new Date(date), 'HH:mm');

export const formatChatTime = (date: string): string => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd/MM/yyyy');
};

export const formatDateDivider = (date: string): string => {
  const d = new Date(date);
  if (isToday(d)) return 'TODAY';
  if (isYesterday(d)) return 'YESTERDAY';
  return format(d, 'MMMM d, yyyy').toUpperCase();
};

export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
