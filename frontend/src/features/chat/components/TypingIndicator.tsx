export default function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-1">AI</span>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-3 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
