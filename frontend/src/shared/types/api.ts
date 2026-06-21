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
