import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { fetchRows, uploadCSV } from '../services/api';
import type { DataResponse } from '../types';
import { toRowObjects } from '../utils/data';

// ── Types ─────────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 50;

export interface TableState {
  filename: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface DatasetContextValue {
  table: TableState | null;
  isLoading: boolean;
  handleUpload: (file: File) => Promise<void>;
  loadPage: (page: number) => Promise<void>;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function DatasetProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [table, setTable] = useState<TableState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const data: DataResponse = await fetchRows(page, PAGE_SIZE);
      setTable((prev) => ({
        filename: prev?.filename ?? '',
        columns: data.columns,
        rows: toRowObjects(data.columns, data.data),
        totalRows: data.total_rows,
        page: data.page,
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load rows');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const upload = await uploadCSV(file);
        const data: DataResponse = await fetchRows(1, PAGE_SIZE);
        setTable({
          filename: upload.filename,
          columns: data.columns,
          rows: toRowObjects(data.columns, data.data),
          totalRows: data.total_rows,
          page: 1,
        });
        navigate('/data');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  return (
    <DatasetContext.Provider value={{ table, isLoading, handleUpload, loadPage }}>
      {children}
    </DatasetContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDataset(): DatasetContextValue {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used inside <DatasetProvider>');
  return ctx;
}
