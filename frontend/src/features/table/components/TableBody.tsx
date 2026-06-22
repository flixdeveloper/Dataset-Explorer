import { memo } from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import SortIcon from './SortIcon';

interface TableBodyProps {
  table: Table<Record<string, unknown>>;
  isFiltering: boolean;
  globalFilter: string;
}

function TableBody({ table, isFiltering, globalFilter }: TableBodyProps) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm border-collapse">

        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-100 dark:border-gray-800">
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap select-none cursor-pointer transition-colors text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-950 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
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
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-50 dark:border-gray-800/60 transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(TableBody);
