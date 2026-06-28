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

export interface QuestionResponse {
  answer: string;
}
