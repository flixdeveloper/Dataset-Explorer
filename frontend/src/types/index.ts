// ── Backend response shapes ──────────────────────────────────────────────────

export interface UploadResponse {
  filename: string;
  rows_count: number;
}

export interface DataResponse {
  columns: string[];
  data: unknown[][];
  total_rows: number;
  page: number;
}

export interface ContextUsed {
  used_rows: number[];
  used_columns: string[];
}

export interface QuestionResponse {
  answer: string;
  context_used: ContextUsed;
}

// ── App state shapes ─────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context_used?: ContextUsed;
}

export interface AppState {
  hasFile: boolean;
  datasetHeaders: string[];
  datasetRows: Record<string, unknown>[];
  totalRows: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isAnalyzing: boolean;
  highlightedRows: number[];
  highlightedColumns: string[];
}
