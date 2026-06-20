import { useMemo } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';

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
  const colDefs: GridColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: col,
        headerName: col,
        flex: 1,
        minWidth: 130,
        cellClassName: highlightedColumns.includes(col)
          ? 'col-highlight'
          : '',
        headerClassName: highlightedColumns.includes(col)
          ? 'col-highlight-header'
          : '',
      })),
    [columns, highlightedColumns],
  );

  const paginationModel: GridPaginationModel = {
    page: page - 1, // DataGrid is 0-indexed; backend is 1-indexed
    pageSize,
  };

  return (
    <DataGrid
      rows={rows}
      columns={colDefs}
      rowCount={totalRows}
      loading={loading}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={(model) => onPageChange(model.page + 1)}
      pageSizeOptions={[pageSize]}
      disableRowSelectionOnClick
      getRowClassName={({ id }) =>
        highlightedRows.includes(id as number) ? 'row-highlight' : ''
      }
      sx={{
        border: 'none',
        fontFamily: 'inherit',
        '& .MuiDataGrid-columnHeader': {
          backgroundColor: '#f9fafb',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280',
        },
        '& .MuiDataGrid-cell': {
          fontSize: '0.875rem',
          color: '#111827',
          borderColor: '#f3f4f6',
        },
        '& .MuiDataGrid-row:hover': { backgroundColor: '#f9fafb' },
        '& .row-highlight': {
          backgroundColor: '#eff6ff',
          '&:hover': { backgroundColor: '#dbeafe' },
        },
        '& .col-highlight': { backgroundColor: '#f0fdf4' },
        '& .col-highlight-header': { backgroundColor: '#dcfce7 !important' },
        '& .MuiDataGrid-footerContainer': {
          borderTop: '1px solid #f3f4f6',
        },
      }}
    />
  );
}
