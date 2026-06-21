import TableToolbar from '@/components/table/TableToolbar';
import TableBody from '@/components/table/TableBody';
import TablePagination from '@/components/table/TablePagination';
import { useDataTable } from '@/components/table/useDataTable';

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
  const {
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
  } = useDataTable({ columns, rows, totalRows, page, pageSize });

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
