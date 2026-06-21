import type { ContextUsed } from '@/types/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context_used?: ContextUsed;
}
