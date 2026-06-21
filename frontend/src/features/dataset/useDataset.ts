import { useContext } from 'react';

import { DatasetActionsContext, DatasetStateContext } from './DatasetContext';
import type {
  DatasetActionsContextValue,
  DatasetContextValue,
  DatasetStateContextValue,
} from './types';

export function useDatasetState(): DatasetStateContextValue {
  const ctx = useContext(DatasetStateContext);
  if (!ctx) throw new Error('useDatasetState must be used inside <DatasetProvider>');
  return ctx;
}

export function useDatasetActions(): DatasetActionsContextValue {
  const ctx = useContext(DatasetActionsContext);
  if (!ctx) throw new Error('useDatasetActions must be used inside <DatasetProvider>');
  return ctx;
}

export function useDataset(): DatasetContextValue {
  return { ...useDatasetState(), ...useDatasetActions() };
}
