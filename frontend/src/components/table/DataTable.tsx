import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  ChevronsUpDown, Loader2, Search, SlidersHorizontal, X,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function isMonoColumn(col: string): boolean {
  const c = col.toLowerCase();
  return c.includes('id') || c.includes('date') || c.includes('time') || c.includes('code');
}

function formatCell(value: unknown): string {
  if (value == null) return '—';
  return String(value);
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc')  return <ChevronUp    className="w-3 h-3 ml-1 inline" />;
  if (sorted === 'desc') return <ChevronDown   className="w-3 h-3 ml-1 inline" />;
  return <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
}

// ── Component ──────────────────────────────────────────────────────────────────

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
  const startRow   = (page - 1) * pageSize + 1;
  const endRow     = Math.min(page * pageSize, totalRows);

  const [sorting,          setSorting]          = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter,     setGlobalFilter]     = useState('');
  const [colsOpen,         setColsOpen]         = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node))
        setColsOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const columnDefs = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col,
        header: col.replace(/_/g, ' '),
        cell: ({ getValue }) => (
          <span className={isMonoColumn(col)
            ? 'font-mono text-xs text-gray-500 dark:text-gray-400'
            : 'text-sm text-gray-700 dark:text-gray-300'}>
            {formatCell(getValue())}
          </span>
        ),
        filterFn: 'includesString',
      })),
    [columns],
  );

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    manualPagination: true,
    pageCount: totalPages,
  });

  const isFiltering     = globalFilter.trim().length > 0;
  const filteredCount   = table.getFilteredRowModel().rows.length;
  const visibleColCount = table.getVisibleLeafColumns().length;
  const hiddenCount     = Object.values(columnVisibility).filter((v) => v === false).length;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">

        {/* Global search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter rows…"
            className="w-full pl-8 pr-7 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-blue-300 dark:focus:border-blue-600 transition-colors"
          />
          {isFiltering && (
            <button
              onClick={() => setGlobalFilter('')}
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
              {table.getAllLeafColumns().map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
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

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 dark:border-gray-800">
                {headerGroup.headers.map((header) => {
                  const col       = header.column.id;
                  const isHighCol = highlightedColumns.includes(col);
                  const sorted    = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap select-none cursor-pointer transition-colors
                        ${isHighCol
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                          : 'text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-950 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon sorted={sorted} />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColCount} className="px-4 py-16 text-center">
                  <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-600 animate-spin mx-auto" />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColCount} className="px-4 py-16 text-center text-sm text-gray-400 dark:text-gray-600">
                  {isFiltering ? `No rows match "${globalFilter}"` : 'No data'}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowId = row.original.id as number;
                const isHighlighted = highlightedRows.includes(rowId);
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-50 dark:border-gray-800/60 transition-colors
                      ${isHighlighted
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/40'}`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const col       = cell.column.id;
                      const isHighCol = highlightedColumns.includes(col);
                      return (
                        <td
                          key={cell.id}
                          className={`px-4 py-2.5 whitespace-nowrap
                            ${isHighCol && !isHighlighted ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

      {/* ── Pagination footer ──────────────────────────────────────────────── */}
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
    </div>
  );
}
