export const PAGE_SIZE = 50;

export interface TableState {
  filename: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
}

export interface DatasetStateContextValue {
  table: TableState | null;
  isLoading: boolean;
}

export interface DatasetActionsContextValue {
  handleUpload: (file: File) => Promise<void>;
  loadPage: (page: number) => Promise<void>;
}

export type DatasetContextValue = DatasetStateContextValue & DatasetActionsContextValue;
