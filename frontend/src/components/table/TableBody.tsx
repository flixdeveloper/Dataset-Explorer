import { flexRender, type Table } from '@tanstack/react-table';
import SortIcon from './SortIcon';

interface TableBodyProps {
  table: Table<Record<string, unknown>>;
  isFiltering: boolean;
  globalFilter: string;
  highlightedRows: number[];
  highlightedColumns: string[];
}

export default function TableBody({
  table,
  isFiltering,
  globalFilter,
  highlightedRows,
  highlightedColumns,
}: TableBodyProps) {
  return (
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
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-16 text-center text-sm text-gray-400 dark:text-gray-600">
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
  );
}
