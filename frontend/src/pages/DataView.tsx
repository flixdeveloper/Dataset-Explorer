import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DataViewHeader from '@/shared/components/DataViewHeader';
import { DataTable } from '@/features/table';
import { ChatPanel } from '@/features/chat';
import { useDatasetActions, useDatasetState, PAGE_SIZE } from '@/features/dataset';

const SYSTEM_COL = '__sys_agent_row_id__';

export default function DataView() {
  const navigate = useNavigate();
  const { table, isLoading } = useDatasetState();
  const { loadPage } = useDatasetActions();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const columns = useMemo(
    () => (table ? table.columns.filter(c => c !== SYSTEM_COL) : []),
    [table],
  );

  useEffect(() => {
    if (!table) navigate('/', { replace: true });
  }, [table, navigate]);

  if (!table) return null;

  const rows      = table.rows;
  const totalRows = table.totalRows;
  const page      = table.page;
  const filename  = table.filename;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DataViewHeader
        filename={filename}
        totalRows={totalRows}
        totalColumns={columns.length}
        sidebarOpen={sidebarOpen}
        onNewFile={() => navigate('/')}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
      />

      <div className="flex flex-1 overflow-hidden px-2">
        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            totalRows={totalRows}
            page={page}
            pageSize={PAGE_SIZE}
            loading={isLoading}
            onPageChange={loadPage}
          />
        </div>

        <ChatPanel open={sidebarOpen} />
      </div>
    </div>
  );
}
