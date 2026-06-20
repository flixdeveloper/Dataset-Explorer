import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { StatusBadge, isStatusValue } from './StatusBadge';

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  highlightedRows?: number[];
  highlightedColumns?: string[];
}

function isMonoColumn(col: string): boolean {
  const c = col.toLowerCase();
  return c.includes('id') || c.includes('date') || c.includes('time') || c.includes('code');
}

function formatCell(value: unknown): string {
  if (value == null) return '—';
  return String(value);
}

export default function DataTable({
  columns,
  rows,
  totalRows,
  page,
  pageSize,
  loading,
  onPageChange,
  highlightedRows = [],
  highlightedColumns = [],
}: DataTableProps) {
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* Scrollable table area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {columns.map((col) => (
                <th
                  key={col}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap
                    ${highlightedColumns.includes(col)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-950'
                    }`}
                >
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-600 animate-spin mx-auto" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-gray-400 dark:text-gray-600">
                  No data
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const rowId = row.id as number;
                const isHighlighted = highlightedRows.includes(rowId);
                return (
                  <tr
                    key={rowId ?? i}
                    className={`border-b border-gray-50 dark:border-gray-800/60 transition-colors
                      ${isHighlighted
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/40'}`}
                  >
                    {columns.map((col) => {
                      const value = row[col];
                      const isHighCol = highlightedColumns.includes(col);
                      return (
                        <td
                          key={col}
                          className={`px-4 py-2.5 whitespace-nowrap
                            ${isHighCol && !isHighlighted ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                        >
                          {isStatusValue(value) ? (
                            <StatusBadge value={value} />
                          ) : (
                            <span
                              className={
                                isMonoColumn(col)
                                  ? 'font-mono text-xs text-gray-500 dark:text-gray-400'
                                  : 'text-sm text-gray-700 dark:text-gray-300'
                              }
                            >
                              {formatCell(value)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          Showing rows {startRow}–{endRow} of {totalRows.toLocaleString()}
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
    </div>
  );
}
