import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, Sparkles } from 'lucide-react';
import { askQuestion, fetchSuggestions } from '../../services/api';
import { useDataset } from '../../context/DatasetContext';
import type { ChatMessage } from '../../types';

export default function ChatPanel() {
  const { table } = useDataset();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasChatted = messages.length > 0;

  useEffect(() => {
    if (!table) return;
    setLoadingSuggestions(true);
    fetchSuggestions()
      .then((res) => setSuggestions(res.questions))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, [table?.filename]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function submit(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setIsLoading(true);

    try {
      const res = await askQuestion(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, context_used: res.context_used },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-[15px] border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">AI Analysis</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!hasChatted ? (
          <>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-3">
              Suggestions
            </p>
            <div className="flex flex-col gap-2">
              {loadingSuggestions
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                      style={{ opacity: 1 - i * 0.15 }}
                    />
                  ))
                : suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="group flex items-center justify-between w-full text-left px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{s}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
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
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-1">AI</span>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-300 dark:focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-gray-800 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(input)}
            placeholder="Ask a question…"
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || isLoading}
            className="p-0.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
