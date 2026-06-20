const STATUS_STYLES: Record<string, string> = {
  shipped:    'bg-blue-50 text-blue-600',
  delivered:  'bg-green-50 text-green-700',
  processing: 'bg-orange-50 text-orange-600',
  cancelled:  'bg-red-50 text-red-500',
  canceled:   'bg-red-50 text-red-500',
  pending:    'bg-gray-100 text-gray-500',
  returned:   'bg-purple-50 text-purple-600',
};

export function isStatusValue(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return value.toLowerCase() in STATUS_STYLES;
}

export function StatusBadge({ value }: { value: string }) {
  const styles = STATUS_STYLES[value.toLowerCase()] ?? 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {value}
    </span>
  );
}
