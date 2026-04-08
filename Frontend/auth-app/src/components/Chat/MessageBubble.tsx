import { formatMessageTime } from '../../utils/format';
import type { Message } from '../../types';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showTail?: boolean;
}

export const MessageBubble = ({ message, isMine, showTail = true }: MessageBubbleProps) => {
  return (
    <div className={clsx('flex msg-animate', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'relative max-w-[65%] min-w-20 px-3 py-2 rounded-lg shadow-sm',
          isMine
            ? 'bg-[#005c4b] text-[#e9edef] rounded-br-none'
            : 'bg-[#202c33] text-[#e9edef] rounded-bl-none'
        )}
      >
        {/* Bubble tail */}
        {showTail && (
          <span
            className={clsx(
              'absolute bottom-0 w-3 h-3',
              isMine
                ? '-right-1.5 [clip-path:polygon(0_0,0_100%,100%_100%)] bg-[#005c4b]'
                : '-left-1.5 [clip-path:polygon(100%_0,0_100%,100%_100%)] bg-[#202c33]'
            )}
          />
        )}

        {/* Text */}
        {message.text && (
          <p className="text-[14.5px] leading-[1.45] break-words whitespace-pre-wrap pr-12">
            {message.text}
          </p>
        )}

        {/* Time + tick */}
        <div className={clsx(
          'absolute bottom-1.5 right-2.5 flex items-center gap-0.5',
        )}>
          <span className="text-[11px] text-[#8696a0]">
            {formatMessageTime(message.createdAt)}
          </span>
          {isMine && (
            <div className="flex items-center ml-0.5">
              <svg
                className={clsx('w-3.5 h-3.5', message.seen ? 'text-[#53bdeb]' : 'text-[#8696a0]')}
                viewBox="0 0 16 15"
                fill="currentColor"
              >
                <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
