import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
} from '@tanstack/react-table';

import { isMonoColumn, formatCell } from './tableUtils';
import TableToolbar from './TableToolbar';
import TableBody from './TableBody';
import TablePagination from './TablePagination';
import { useTableFilters } from './useTableFilters';

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

  const {
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    globalFilter,
    setGlobalFilter,
  } = useTableFilters();

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

  const isFiltering   = globalFilter.trim().length > 0;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const hiddenCount   = Object.values(columnVisibility).filter((v) => v === false).length;

  const leafColumns = table.getAllLeafColumns().map((col) => ({
    id: col.id,
    isVisible: col.getIsVisible(),
    toggle: col.getToggleVisibilityHandler() as () => void,
  }));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <TableToolbar
        globalFilter={globalFilter}
        onFilterChange={setGlobalFilter}
        leafColumns={leafColumns}
        hiddenCount={hiddenCount}
      />
      <TableBody
        table={table}
        isFiltering={isFiltering}
        globalFilter={globalFilter}
        highlightedRows={highlightedRows}
        highlightedColumns={highlightedColumns}
      />
      <TablePagination
        page={page}
        totalPages={totalPages}
        startRow={startRow}
        endRow={endRow}
        totalRows={totalRows}
        loading={loading}
        isFiltering={isFiltering}
        filteredCount={filteredCount}
        onPageChange={onPageChange}
      />
    </div>
  );
}
