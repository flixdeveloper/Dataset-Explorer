import TableToolbar from './TableToolbar';
import TableBody from './TableBody';
import TablePagination from './TablePagination';
import { useDataTable } from '../hooks/useDataTable';

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function DataTable({
  columns,
  rows,
  totalRows,
  page,
  pageSize,
  loading,
  onPageChange,
}: DataTableProps) {
  const {
    table,
    globalFilter,
    deferredFilter,
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
        globalFilter={deferredFilter}
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
