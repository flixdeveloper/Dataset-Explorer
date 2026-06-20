import { useEffect, useState } from 'react';
import { askQuestion, fetchSuggestions } from '../../services/api';
import { useDataset } from '../../context/DatasetContext';
import type { ChatMessage } from '../../types';
import ChatHeader from './ChatHeader';
import SuggestionList from './SuggestionList';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

interface ChatPanelProps {
  open: boolean;
}

export default function ChatPanel({ open }: ChatPanelProps) {
  const { table } = useDataset();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const hasChatted = messages.length > 0;

  useEffect(() => {
    if (!table) return;
    const controller = new AbortController();
    setLoadingSuggestions(true);
    fetchSuggestions(controller.signal)
      .then((res) => setSuggestions(res.questions))
      .catch((err) => { if (err.name !== 'AbortError') setSuggestions([]); })
      .finally(() => { if (!controller.signal.aborted) setLoadingSuggestions(false); });
    return () => controller.abort();
  }, [table?.filename]);

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
    <aside
      className={`w-80 flex-shrink-0 flex flex-col border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden ${
        open ? '' : 'hidden'
      }`}
    >
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!hasChatted ? (
          <SuggestionList
            suggestions={suggestions}
            loading={loadingSuggestions}
            onSelect={submit}
          />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      <ChatInput
        value={input}
        isLoading={isLoading}
        open={open}
        onChange={setInput}
        onSubmit={submit}
      />
    </aside>
  );
}
