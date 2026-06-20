import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface ColumnMeta {
  id: string;
  isVisible: boolean;
  toggle: () => void;
}

interface TableToolbarProps {
  globalFilter: string;
  onFilterChange: (value: string) => void;
  leafColumns: ColumnMeta[];
  hiddenCount: number;
}

export default function TableToolbar({
  globalFilter,
  onFilterChange,
  leafColumns,
  hiddenCount,
}: TableToolbarProps) {
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);
  const isFiltering = globalFilter.trim().length > 0;

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node))
        setColsOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">

      {/* Global search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter rows…"
          className="w-full pl-8 pr-7 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-blue-300 dark:focus:border-blue-600 transition-colors"
        />
        {isFiltering && (
          <button
            onClick={() => onFilterChange('')}
            aria-label="Clear filter"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Column visibility — pinned to far right */}
      <div className="relative ml-auto" ref={colsRef}>
        <button
          onClick={() => setColsOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors
            ${hiddenCount > 0
              ? 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Columns
          {hiddenCount > 0 && (
            <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {hiddenCount}
            </span>
          )}
        </button>

        {colsOpen && (
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[180px]">
            {leafColumns.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={col.isVisible}
                  onChange={col.toggle}
                  className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {col.id.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
