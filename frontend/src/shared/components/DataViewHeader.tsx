import { FilePlus2, Sparkles } from 'lucide-react';

interface DataViewHeaderProps {
  filename: string;
  totalRows: number;
  totalColumns: number;
  sidebarOpen: boolean;
  onNewFile: () => void;
  onToggleSidebar: () => void;
}

export default function DataViewHeader({
  filename,
  totalRows,
  totalColumns,
  sidebarOpen,
  onNewFile,
  onToggleSidebar,
}: DataViewHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-800 dark:text-gray-200 font-medium font-mono text-sm">{filename}</span>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full font-mono whitespace-nowrap">
          {totalRows.toLocaleString()} rows • {totalColumns} columns
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewFile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          <FilePlus2 className="w-4 h-4" />
          New file
        </button>
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors font-medium
            ${sidebarOpen
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Analysis
        </button>
      </div>
    </div>
  );
}
