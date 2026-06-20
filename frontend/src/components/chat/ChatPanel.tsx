import { useState } from 'react';
import { ArrowRight, Send, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'What is the total revenue?',
  'Which products are most popular?',
  'Show all cancelled orders',
  'Average order value by status',
  'Top 5 customers by spend',
];

interface ChatPanelProps {
  onAsk?: (question: string) => void;
  isLoading?: boolean;
}

export default function ChatPanel({ onAsk, isLoading = false }: ChatPanelProps) {
  const [input, setInput] = useState('');

  function submit(question: string) {
    if (!question.trim() || isLoading) return;
    onAsk?.(question.trim());
    setInput('');
  }

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col border-l border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-sm text-gray-900">AI Analysis</span>
      </div>

      {/* Suggestion chips */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
          Suggestions
        </p>
        <div className="flex flex-col gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="group flex items-center justify-between w-full text-left px-3 py-2.5 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
            >
              <span className="text-sm text-gray-700 leading-snug">{s}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0 ml-2 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat input */}
      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-300 focus-within:bg-white transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(input)}
            placeholder="Ask a question…"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || isLoading}
            className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
