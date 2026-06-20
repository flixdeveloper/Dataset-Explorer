const STATUS_STYLES: Record<string, string> = {
  shipped:    'bg-blue-50   text-blue-600  dark:bg-blue-900/30   dark:text-blue-400',
  delivered:  'bg-green-50  text-green-700 dark:bg-green-900/30  dark:text-green-400',
  processing: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled:  'bg-red-50    text-red-500   dark:bg-red-900/30    dark:text-red-400',
  canceled:   'bg-red-50    text-red-500   dark:bg-red-900/30    dark:text-red-400',
  pending:    'bg-gray-100  text-gray-500  dark:bg-gray-800      dark:text-gray-400',
  returned:   'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export function isStatusValue(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return value.toLowerCase() in STATUS_STYLES;
}

export function StatusBadge({ value }: { value: string }) {
  const styles = STATUS_STYLES[value.toLowerCase()] ?? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {value}
    </span>
  );
}
