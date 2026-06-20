import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  startRow: number;
  endRow: number;
  totalRows: number;
  loading: boolean;
  isFiltering: boolean;
  filteredCount: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  page,
  totalPages,
  startRow,
  endRow,
  totalRows,
  loading,
  isFiltering,
  filteredCount,
  onPageChange,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
        {isFiltering
          ? `${filteredCount} match${filteredCount !== 1 ? 'es' : ''} · rows ${startRow}–${endRow} of ${totalRows.toLocaleString()}`
          : `Showing rows ${startRow}–${endRow} of ${totalRows.toLocaleString()}`}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono px-2 min-w-[60px] text-center">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
