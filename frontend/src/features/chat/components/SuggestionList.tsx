import { ArrowRight } from 'lucide-react';

interface SuggestionListProps {
  suggestions: string[];
  loading: boolean;
  onSelect: (suggestion: string) => void;
}

export default function SuggestionList({ suggestions, loading, onSelect }: SuggestionListProps) {
  const hasContent = loading || suggestions.length > 0;

  return (
    <>
      {hasContent && (
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-3">
          Suggestions
        </p>
      )}
      <div className="flex flex-col gap-2">
        {loading
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
                onClick={() => onSelect(s)}
                className="group flex items-center justify-between w-full text-left px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{s}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0 ml-2 transition-colors" />
              </button>
            ))}
      </div>
    </>
  );
}
