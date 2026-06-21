import { useDatasetState } from '../../context/useDataset';
import ChatHeader from './ChatHeader';
import SuggestionList from './SuggestionList';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatState } from './useChatState';

interface ChatPanelProps {
  open: boolean;
}

export default function ChatPanel({ open }: ChatPanelProps) {
  const { table } = useDatasetState();
  const { state, submit, setInput } = useChatState(table?.filename);

  const { messages, input, isLoading, suggestions, loadingSuggestions } = state;
  const hasChatted = messages.length > 0;

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
