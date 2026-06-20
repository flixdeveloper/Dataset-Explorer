import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  isLoading: boolean;
  open: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function ChatInput({ value, isLoading, open, onChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, open]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
    }
  }

  return (
    <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
      <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-300 dark:focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-gray-800 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none resize-none overflow-hidden leading-relaxed min-h-[22px]"
        />
        <button
          onClick={() => onSubmit(value)}
          disabled={!value.trim() || isLoading}
          className="p-0.5 mb-0.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
