import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DataViewHeader from '../components/layout/DataViewHeader';
import DataTable from '../components/table/DataTable';
import ChatPanel from '../components/chat/ChatPanel';
import { useDataset, PAGE_SIZE } from '../context/DatasetContext';
import { MOCK_COLUMNS, MOCK_ROWS } from '../data/mockData';

const SYSTEM_COL = '__sys_agent_row_id__';

export default function DataView() {
  const navigate = useNavigate();
  const { table, isLoading, loadPage } = useDataset();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMock    = !table;
  const columns   = isMock ? MOCK_COLUMNS : table.columns.filter(c => c !== SYSTEM_COL);
  const rows      = isMock ? MOCK_ROWS    : table.rows;
  const totalRows = isMock ? MOCK_ROWS.length : table.totalRows;
  const page      = isMock ? 1               : table.page;
  const filename  = isMock ? 'sample_orders.csv' : table.filename;

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
            onPageChange={isMock ? () => {} : loadPage}
          />
        </div>

        <ChatPanel open={sidebarOpen} />
      </div>
    </div>
  );
}
