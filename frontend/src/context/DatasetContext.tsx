import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { fetchRows, uploadCSV } from '@/services/api';
import type { DataResponse } from '@/types/api';
import { toRowObjects } from '@/utils/data';
import {
  PAGE_SIZE,
  type DatasetActionsContextValue,
  type DatasetStateContextValue,
  type TableState,
} from '@/context/datasetTypes';

export const DatasetStateContext = createContext<DatasetStateContextValue | null>(null);
export const DatasetActionsContext = createContext<DatasetActionsContextValue | null>(null);

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

  const stateValue = useMemo(
    () => ({ table, isLoading }),
    [table, isLoading],
  );

  const actionsValue = useMemo(
    () => ({ handleUpload, loadPage }),
    [handleUpload, loadPage],
  );

  return (
    <DatasetStateContext.Provider value={stateValue}>
      <DatasetActionsContext.Provider value={actionsValue}>
        {children}
      </DatasetActionsContext.Provider>
    </DatasetStateContext.Provider>
  );
}
