import { Sparkles } from 'lucide-react';

export default function ChatHeader() {
  return (
    <div className="flex items-center gap-2 px-4 pt-3.5 pb-[15px] border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
      <Sparkles className="w-4 h-4 text-blue-500" />
      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">AI Analysis</span>
    </div>
  );
}
