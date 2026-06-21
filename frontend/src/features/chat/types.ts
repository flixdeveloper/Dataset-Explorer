import type { ContextUsed } from '@/shared/types/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context_used?: ContextUsed;
}
