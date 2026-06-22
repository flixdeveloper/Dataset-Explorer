import { useCallback, useEffect, useReducer } from 'react';
import { askQuestion, fetchSuggestions } from '@/shared/services/api';
import type { QuestionResponse } from '@/shared/types/api';
import type { ChatMessage } from '../types';

export interface ChatState {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  suggestions: string[];
  loadingSuggestions: boolean;
}

type ChatAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SUBMIT_START'; payload: string }
  | { type: 'SUBMIT_SUCCESS'; payload: QuestionResponse }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'SUBMIT_END' }
  | { type: 'SUGGESTIONS_LOADING' }
  | { type: 'SUGGESTIONS_SUCCESS'; payload: string[] }
  | { type: 'SUGGESTIONS_ERROR' };

const initialState: ChatState = {
  messages: [],
  input: '',
  isLoading: false,
  suggestions: [],
  loadingSuggestions: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'SUBMIT_START':
      return {
        ...state,
        input: '',
        isLoading: true,
        messages: [...state.messages, { role: 'user', content: action.payload }],
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            role: 'assistant',
            content: action.payload.answer,
            context_used: action.payload.context_used,
          },
        ],
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'assistant', content: action.payload },
        ],
      };
    case 'SUBMIT_END':
      return { ...state, isLoading: false };
    case 'SUGGESTIONS_LOADING':
      return { ...state, loadingSuggestions: true, suggestions: [] };
    case 'SUGGESTIONS_SUCCESS':
      return { ...state, suggestions: action.payload, loadingSuggestions: false };
    case 'SUGGESTIONS_ERROR':
      return { ...state, suggestions: [], loadingSuggestions: false };
    default:
      return state;
  }
}

export function useChatState(datasetFilename: string | undefined) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    if (!datasetFilename) return;
    const controller = new AbortController();
    dispatch({ type: 'SUGGESTIONS_LOADING' });
    fetchSuggestions(controller.signal)
      .then((res) => dispatch({ type: 'SUGGESTIONS_SUCCESS', payload: res.questions }))
      .catch((err) => {
        if (err.name !== 'AbortError') dispatch({ type: 'SUGGESTIONS_ERROR' });
      });
    return () => controller.abort();
  }, [datasetFilename]);

  const submit = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || state.isLoading) return;

    dispatch({ type: 'SUBMIT_START', payload: trimmed });

    try {
      const res = await askQuestion(trimmed);
      dispatch({ type: 'SUBMIT_SUCCESS', payload: res });
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ERROR',
        payload: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    } finally {
      dispatch({ type: 'SUBMIT_END' });
    }
  }, [state.isLoading]);

  const setInput = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT', payload: value });
  }, []);

  return { state, submit, setInput };
}
