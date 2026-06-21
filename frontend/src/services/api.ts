import type { DataResponse, UploadResponse, QuestionResponse } from '../types/api';

const API_BASE = 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body });
  return handleResponse<UploadResponse>(res);
}

export async function fetchRows(page: number, pageSize = 50): Promise<DataResponse> {
  const res = await fetch(
    `${API_BASE}/rows?page=${page}&page_size=${pageSize}`,
  );
  return handleResponse<DataResponse>(res);
}

export async function askQuestion(question: string): Promise<QuestionResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return handleResponse<QuestionResponse>(res);
}

export async function fetchSuggestions(signal?: AbortSignal): Promise<{ questions: string[] }> {
  const res = await fetch(`${API_BASE}/suggestions`, { signal });
  return handleResponse<{ questions: string[] }>(res);
}
