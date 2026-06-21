import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-1">
        {isUser ? 'You' : 'AI'}
      </span>
      <div
        className={`max-w-[92%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-tr-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
