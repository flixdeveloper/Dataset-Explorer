import type { ContextUsed } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context_used?: ContextUsed;
}
