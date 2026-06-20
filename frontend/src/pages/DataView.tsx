import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import DataTable from '../components/table/DataTable';
import { useDataset, PAGE_SIZE } from '../context/DatasetContext';

export default function DataView() {
  const navigate = useNavigate();
  const { table, isLoading, loadPage } = useDataset();

  // Redirect to home if no dataset is loaded (e.g. on hard refresh)
  useEffect(() => {
    if (!table) navigate('/', { replace: true });
  }, [table, navigate]);

  if (!table) return null;

  return (
    <main className="flex-1 flex flex-col p-6 min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold font-mono">{table.filename}</h2>
          <p className="text-sm text-gray-400 font-mono">
            {table.totalRows.toLocaleString()} rows · {table.columns.length} columns
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-sm font-mono text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← upload new file
        </button>
      </div>

      <div
        className="flex-1 border border-gray-100 rounded-xl overflow-hidden"
        style={{ height: 600 }}
      >
        <DataTable
          columns={table.columns}
          rows={table.rows}
          totalRows={table.totalRows}
          page={table.page}
          pageSize={PAGE_SIZE}
          loading={isLoading}
          onPageChange={loadPage}
        />
      </div>
    </main>
  );
}
