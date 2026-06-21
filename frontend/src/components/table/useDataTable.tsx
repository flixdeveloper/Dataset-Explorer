import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
} from '@tanstack/react-table';

import { isMonoColumn, formatCell } from '@/components/table/tableUtils';
import { useTableFilters } from '@/components/table/useTableFilters';
import type { ColumnMeta } from '@/components/table/tableTypes';

interface UseDataTableOptions {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  pageSize: number;
}

export function useDataTable({ columns, rows, totalRows, page, pageSize }: UseDataTableOptions) {
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

  const leafColumns: ColumnMeta[] = table.getAllLeafColumns().map((col) => ({
    id: col.id,
    isVisible: col.getIsVisible(),
    toggle: col.getToggleVisibilityHandler() as () => void,
  }));

  return {
    table,
    globalFilter,
    setGlobalFilter,
    isFiltering,
    filteredCount,
    hiddenCount,
    leafColumns,
    totalPages,
    startRow,
    endRow,
  };
}
